package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.dto.CheckInReportDto;
import com.gym.enterprise_system.entity.CheckIn;
import com.gym.enterprise_system.entity.Role;
import com.gym.enterprise_system.entity.StaffPayment;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.CheckInRepository;
import com.gym.enterprise_system.repository.StaffPaymentRepository;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/checkin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CheckInController {

    private final CheckInRepository checkInRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final StaffPaymentRepository staffPaymentRepository;

    // Simulate QR Scanner at Front Desk
    @PostMapping("/scan")
    public ResponseEntity<?> scanQrCode(@RequestBody Map<String, String> request) {
        String userIdStr = request.get("userId");
        String locationId = request.get("locationId");

        if (userIdStr == null || userIdStr.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing User ID."));
        }

        if (!"ENTERPRISE-GYM-FRONT-DESK".equals(locationId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid facility QR Code scanned."));
        }

        UUID userId;
        try {
            userId = UUID.fromString(userIdStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Malformed QR Code."));
        }

        User user = userRepository.findById(userId)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Member not found."));
        }

        // Logic: Find the most recent checkin.
        // If it exists and has NO checkout time -> They are leaving -> Set checkout
        // time
        // If it exists and HAS a checkout time -> They are entering -> Create new
        // checkin
        // If none exists -> They are entering -> Create new checkin

        Optional<CheckIn> latestCheckIn = checkInRepository.findFirstByUserIdOrderByCheckInTimeDesc(userId);

        if (latestCheckIn.isPresent() && latestCheckIn.get().getCheckOutTime() == null) {
            // Member is EXITING
            CheckIn activeCheckIn = latestCheckIn.get();
            activeCheckIn.setCheckOutTime(LocalDateTime.now());
            checkInRepository.save(activeCheckIn);

            // Staff Pay Calculation
            if (user.getRole() == Role.STAFF) {
                BigDecimal hourlyRate = user.getHourlyRate() != null ? user.getHourlyRate() : BigDecimal.ZERO;
                if (hourlyRate.compareTo(BigDecimal.ZERO) > 0) {
                    Duration duration = Duration.between(activeCheckIn.getCheckInTime(), activeCheckIn.getCheckOutTime());
                    long seconds = duration.getSeconds();
                    BigDecimal hours = BigDecimal.valueOf(seconds).divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP);
                    BigDecimal totalAmount = hours.multiply(hourlyRate).setScale(2, RoundingMode.HALF_UP);

                    StaffPayment payment = StaffPayment.builder()
                            .user(user)
                            .checkIn(activeCheckIn)
                            .hoursWorked(hours)
                            .hourlyRate(hourlyRate)
                            .totalAmount(totalAmount)
                            .build();
                    staffPaymentRepository.save(payment);
                }
            }

            return ResponseEntity.ok(Map.of(
                    "status", "EXIT",
                    "message", "Goodbye, " + user.getFirstName() + "!",
                    "user", user.getFirstName() + " " + user.getLastName()));
        } else {
            // Member is ENTERING
            CheckIn newCheckIn = CheckIn.builder()
                    .user(user)
                    // checkInTime is handled by @CreationTimestamp
                    .build();
            checkInRepository.save(newCheckIn);
            return ResponseEntity.ok(Map.of(
                    "status", "ENTER",
                    "message", "Welcome, " + user.getFirstName() + "!",
                    "user", user.getFirstName() + " " + user.getLastName()));
        }
    }

    // Get live roster of members currently inside
    @GetMapping("/active")
    public ResponseEntity<List<CheckInReportDto>> getActiveCheckIns() {
        List<CheckInReportDto> activeUsers = checkInRepository.findByCheckOutTimeIsNull()
                .stream()
                .map(c -> {
                    List<String> packages = new java.util.ArrayList<>();
                    if ("MEMBER".equals(c.getUser().getRole().name())) {
                        subscriptionRepository.findByUserIdAndStatus(c.getUser().getId(), "ACTIVE")
                                .ifPresent(sub -> {
                                    if (sub.getPlan() != null) {
                                        packages.add(sub.getPlan().getName());
                                    }
                                });
                    }
                    return CheckInReportDto.builder()
                            .checkInId(c.getId())
                            .userId(c.getUser().getId())
                            .firstName(c.getUser().getFirstName())
                            .lastName(c.getUser().getLastName())
                            .email(c.getUser().getEmail())
                            .photoUrl(c.getUser().getProfilePhotoPath() != null
                                    ? "http://localhost:8080" + c.getUser().getProfilePhotoPath()
                                    : null)
                            .checkInTime(c.getCheckInTime())
                            .userType(c.getUser().getRole().name())
                            .enrolledPackages(packages)
                            .build();
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(activeUsers);
    }
}
