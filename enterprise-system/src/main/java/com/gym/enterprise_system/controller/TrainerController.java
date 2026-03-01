package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.NotificationRepository;
import com.gym.enterprise_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.gym.enterprise_system.service.FileStorageService;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrainerController {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    // Fetch Notifications for Dashboard
    @GetMapping("/{userId}/notifications")
    public ResponseEntity<?> getNotifications(@PathVariable UUID userId) {
        List<Map<String, Object>> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(n -> Map.<String, Object>of(
                        "id", n.getId(),
                        "message", n.getMessage(),
                        "isRead", n.getIsRead(),
                        "date", n.getCreatedAt()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(notifs);
    }

    // Account Activation (Set Password)
    @PostMapping("/activate")
    public ResponseEntity<?> activateAccount(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.getPasswordHash().startsWith("[TEMP_HASH]")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Account is already activated. Please login normally."));
        }

        // In a real app, use BCryptPasswordEncoder here
        user.setPasswordHash("[BCRYPT_HASH_SIMULATION]_" + newPassword);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Account activated successfully! You can now log in."));
    }

    // Get Profile Data
    @GetMapping("/{userId}/profile")
    public ResponseEntity<?> getProfile(@PathVariable UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();

        return ResponseEntity.ok(Map.of(
                "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                "lastName", user.getLastName() != null ? user.getLastName() : "",
                "email", user.getEmail() != null ? user.getEmail() : "",
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "address", user.getAddress() != null ? user.getAddress() : "",
                "photoUrl",
                user.getProfilePhotoPath() != null ? "http://localhost:8080" + user.getProfilePhotoPath() : ""));
    }

    // Profile Update (Multipart for photo)
    @PutMapping("/{userId}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable UUID userId,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("phone") String phone,
            @RequestParam("address") String address,
            @RequestParam(value = "photo", required = false) MultipartFile photo) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setPhone(phone);
        user.setAddress(address);

        if (photo != null && !photo.isEmpty()) {
            String photoPath = fileStorageService.storeFile(photo, userId);
            user.setProfilePhotoPath(photoPath);
        }

        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully.",
                "photoUrl",
                user.getProfilePhotoPath() != null ? "http://localhost:8080" + user.getProfilePhotoPath() : ""));
    }
}