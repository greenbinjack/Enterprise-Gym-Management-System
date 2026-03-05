package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.Room;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.entity.MembershipPlan;
import com.gym.enterprise_system.repository.ClassBookingRepository;
import com.gym.enterprise_system.repository.ClassSessionRepository;
import com.gym.enterprise_system.repository.RoomRepository;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.repository.MembershipPlanRepository;
import com.gym.enterprise_system.service.SchedulingService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/scheduling")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SchedulingController {

    private final SchedulingService schedulingService;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final MembershipPlanRepository planRepository;

    @Autowired
    private final ClassSessionRepository classSessionRepository;

    @Autowired
    private final ClassBookingRepository classBookingRepository;

    // Fetch dropdown data for the Admin UI
    @GetMapping("/setup-data")
    public ResponseEntity<?> getSetupData() {
        List<Room> rooms = roomRepository.findAll();
        // Fetch users who have the TRAINER role
        List<User> trainers = userRepository.findAll().stream()
                .filter(u -> "TRAINER".equals(u.getRole().name()))
                .toList();
        return ResponseEntity.ok(Map.of("rooms", rooms, "trainers", trainers));
    }

    // Admin creates a class (or recurring classes)
    @PostMapping("/admin/classes")
    public ResponseEntity<?> createClass(@RequestBody Map<String, Object> request) {
        try {
            schedulingService.createAdminClass(
                    UUID.fromString((String) request.get("roomId")),
                    UUID.fromString((String) request.get("trainerId")),
                    (String) request.get("name"),
                    (String) request.get("startTime"),
                    (String) request.get("endTime"),
                    Integer.parseInt(request.get("maxCapacity").toString()),
                    Integer.parseInt(request.get("weeksToRepeat").toString()));
            return ResponseEntity.ok(Map.of("message", "Class schedule created successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Trainer: View their complete dashboard schedule
    @GetMapping("/trainer/{trainerId}/dashboard")
    public ResponseEntity<?> getTrainerDashboard(@PathVariable UUID trainerId) {
        try {
            return ResponseEntity.ok(schedulingService.getTrainerDashboardData(trainerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/check-availability")
    public ResponseEntity<?> checkAvailability(@RequestBody Map<String, Object> req) {
        try {
            return ResponseEntity.ok(schedulingService.getAvailableResources(
                    (List<String>) req.get("daysOfWeek"),
                    req.get("time").toString(),
                    Integer.parseInt(req.get("duration").toString()),
                    Integer.parseInt(req.get("weeks").toString())));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/bundle")
    public ResponseEntity<?> createBundle(@RequestBody Map<String, Object> req) {
        try {
            List<String> daysOfWeek = new ArrayList<>();
            Object daysObj = req.get("daysOfWeek");
            if (daysObj instanceof List) {
                daysOfWeek = (List<String>) daysObj;
            } else if (daysObj instanceof String) {
                daysOfWeek = List.of(((String) daysObj).split(","));
            }

            schedulingService.createClassBundle(
                    req.get("name").toString(),
                    daysOfWeek,
                    req.get("time").toString(),
                    Integer.parseInt(req.get("duration").toString()),
                    Integer.parseInt(req.get("weeks").toString()),
                    UUID.fromString(req.get("roomId").toString()),
                    UUID.fromString(req.get("trainerId").toString()),
                    Integer.parseInt(req.get("classSeats").toString()));
            return ResponseEntity.ok(Map.of("message", "Class bundle generated successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // THE MISSING ENDPOINT: This loads the calendar!
    @GetMapping("/classes")
    public ResponseEntity<?> getAllClasses() {
        try {
            // Fetches all scheduled classes and sorts them chronologically
            return ResponseEntity.ok(classSessionRepository.findAll().stream()
                    .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                    .toList());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Member: Fetch classes they are currently booked for
    @GetMapping("/member/{userId}/bookings")
    public ResponseEntity<?> getMemberBookings(@PathVariable UUID userId) {
        try {
            // In a real app, query ClassBookingRepository for 'ENROLLED' or 'WAITLISTED'
            // For now, we will return a simplified list of class sessions joined by the
            // User's bookings
            List<Map<String, Object>> bookings = classBookingRepository.findAll().stream()
                    .filter(b -> b.getUser().getId().equals(userId) &&
                            ("ENROLLED".equals(b.getStatus()) || "WAITLISTED".equals(b.getStatus())))
                    .map(b -> Map.<String, Object>of(
                            "id", b.getClassSession().getId(),
                            "name", b.getClassSession().getName(),
                            "startTime", b.getClassSession().getStartTime(),
                            "endTime", b.getClassSession().getEndTime(),
                            "room", b.getClassSession().getRoom().getName(),
                            "trainer",
                            b.getClassSession().getTrainer().getFirstName() + " "
                                    + b.getClassSession().getTrainer().getLastName(),
                            "status", b.getStatus()))
                    .sorted((a, b) -> ((java.time.LocalDateTime) a.get("startTime"))
                            .compareTo((java.time.LocalDateTime) b.get("startTime")))
                    .toList();

            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Member: Book a class
    @PostMapping("/member/book")
    public ResponseEntity<?> bookClass(@RequestBody Map<String, String> request) {
        try {
            UUID userId = UUID.fromString(request.get("userId"));
            UUID classId = UUID.fromString(request.get("classId"));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            com.gym.enterprise_system.entity.ClassSession session = classSessionRepository.findById(classId)
                    .orElseThrow(() -> new IllegalArgumentException("Class not found"));

            // Check if already booked
            if (classBookingRepository.findByClassSessionIdAndUserId(classId, userId).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "You are already booked for this class."));
            }

            // Create Booking
            com.gym.enterprise_system.entity.ClassBooking booking = com.gym.enterprise_system.entity.ClassBooking
                    .builder()
                    .classSession(session)
                    .user(user)
                    .status("ENROLLED") // Trigger will handle WAITLIST promotion if full
                    .build();

            classBookingRepository.save(booking);

            return ResponseEntity.ok(Map.of("message", "Successfully booked class: " + session.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // NEW: Member available classes (filtered by subscription)
    @GetMapping("/member/{userId}/available-classes")
    public ResponseEntity<?> getMemberAvailableClasses(@PathVariable UUID userId) {
        try {
            // Fetch user subscriptions
            List<com.gym.enterprise_system.entity.Subscription> subs = schedulingService.getUserSubscriptions(userId);

            // Find the furthest end date
            java.time.LocalDateTime maxEndDate = subs.stream()
                    .map(com.gym.enterprise_system.entity.Subscription::getEndDate)
                    .filter(java.util.Objects::nonNull)
                    .max(java.time.LocalDateTime::compareTo)
                    .orElse(java.time.LocalDateTime.now().plusDays(7)); // Or some default

            // Fetch all classes
            List<com.gym.enterprise_system.entity.ClassSession> allClasses = classSessionRepository.findAll();

            // Filter classes that start before maxEndDate
            List<com.gym.enterprise_system.entity.ClassSession> filtered = allClasses.stream()
                    .filter(cls -> cls.getStartTime().isBefore(maxEndDate))
                    .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                    .toList();
            return ResponseEntity.ok(filtered);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Sync/Generate missing sessions for all existing active plans
    @PostMapping("/admin/sync-all-plans")
    public ResponseEntity<?> syncAllPlans() {
        try {
            List<MembershipPlan> activePlans = planRepository.findByIsActiveTrue();
            int plansSynced = 0;
            for (MembershipPlan plan : activePlans) {
                if ("CLASS_PACKAGE".equals(plan.getCategory()) &&
                        plan.getRecurringDayOfWeek() != null &&
                        plan.getRecurringStartTime() != null &&
                        plan.getAllocatedRoomId() != null &&
                        plan.getTrainers() != null &&
                        !plan.getTrainers().isEmpty()) {

                    // Generate 52 weeks
                    schedulingService.createClassBundle(
                            plan.getName(),
                            Arrays.asList(plan.getRecurringDayOfWeek().split(",")),
                            plan.getRecurringStartTime(),
                            plan.getDurationMinutes() != null ? plan.getDurationMinutes() : 60,
                            52,
                            plan.getAllocatedRoomId(),
                            plan.getTrainers().iterator().next().getId(),
                            plan.getAllocatedSeats() != null ? plan.getAllocatedSeats() : 30);
                    plansSynced++;
                }
            }
            return ResponseEntity.ok(Map.of("message", "Synced " + plansSynced + " class plans. Sessions generated."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}