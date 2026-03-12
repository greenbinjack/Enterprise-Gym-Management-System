package com.gym.enterprise_system.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gym.enterprise_system.entity.ClassSession;
import com.gym.enterprise_system.entity.MembershipPlan;
import com.gym.enterprise_system.entity.Room;
import com.gym.enterprise_system.entity.TrainerCommission;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.ClassBookingRepository;
import com.gym.enterprise_system.repository.ClassSessionRepository;
import com.gym.enterprise_system.repository.MembershipPlanRepository;
import com.gym.enterprise_system.repository.RoomRepository;
import com.gym.enterprise_system.repository.SubscriptionRepository;
import com.gym.enterprise_system.repository.TrainerCommissionRepository;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.service.SchedulingService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/scheduling")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SchedulingController {

    private final SchedulingService schedulingService;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final MembershipPlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;

    @Autowired
    private final ClassSessionRepository classSessionRepository;

    @Autowired
    private final ClassBookingRepository classBookingRepository;

    private final TrainerCommissionRepository trainerCommissionRepository;

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

    // Member: Get available classes based on their active subscriptions
    // Pure Java implementation - no DB function required
    @GetMapping("/member/{userId}/available-classes")
    public ResponseEntity<?> getMemberAvailableClasses(@PathVariable UUID userId) {
        try {
            // Get all active subscriptions for the user
            List<com.gym.enterprise_system.entity.Subscription> activeSubs = subscriptionRepository.findAllByUserId(userId).stream()
                    .filter(s -> "ACTIVE".equals(s.getStatus()))
                    .toList();

            if (activeSubs.isEmpty()) {
                return ResponseEntity.ok(List.of()); // No active plan
            }

            // Return class sessions that fall within any active subscription's date range
            List<Map<String, Object>> sessions = classSessionRepository.findAll().stream()
                    .filter(cs -> cs.getStartTime() != null && cs.getStartTime().isAfter(LocalDateTime.now()))
                    .filter(cs -> activeSubs.stream().anyMatch(sub -> 
                        !cs.getStartTime().isBefore(sub.getStartDate()) && 
                        !cs.getStartTime().isAfter(sub.getEndDate())
                    ))
                    .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                    .map(cs -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("sessionId", cs.getId());
                        m.put("name", cs.getName());
                        m.put("startTime", cs.getStartTime());
                        m.put("endTime", cs.getEndTime());
                        m.put("maxCapacity", cs.getMaxCapacity());
                        m.put("roomId", cs.getRoom() != null ? cs.getRoom().getId() : null);
                        m.put("roomName", cs.getRoom() != null ? cs.getRoom().getName() : "");
                        m.put("trainerId", cs.getTrainer() != null ? cs.getTrainer().getId() : null);
                        m.put("trainerFirstName", cs.getTrainer() != null ? cs.getTrainer().getFirstName() : "");
                        m.put("trainerLastName", cs.getTrainer() != null ? cs.getTrainer().getLastName() : "");
                        m.put("remainingCapacity", cs.getMaxCapacity());
                        return m;
                    })
                    .toList();

            return ResponseEntity.ok(sessions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Member: Get all their bookings (non-cancelled)
    @GetMapping("/member/{userId}/booked-classes")
    public ResponseEntity<?> getMemberBookedClasses(@PathVariable UUID userId) {
        try {
            List<Map<String, Object>> bookings = classBookingRepository.findByUserId(userId).stream()
                    .filter(b -> !"CANCELLED".equals(b.getStatus()))
                    .map(b -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("bookingId", b.getId());
                        m.put("status", b.getStatus());
                        m.put("bookedAt", b.getBookedAt());
                        var session = b.getClassSession();
                        if (session != null) {
                            m.put("sessionId", session.getId());
                            m.put("name", session.getName());
                            m.put("startTime", session.getStartTime());
                            m.put("endTime", session.getEndTime());
                            m.put("maxCapacity", session.getMaxCapacity());
                            m.put("room", session.getRoom() != null ? session.getRoom().getName() : "");
                            m.put("trainer", session.getTrainer() != null
                                    ? session.getTrainer().getFirstName() + " " + session.getTrainer().getLastName()
                                    : "");
                        }
                        return m;
                    })
                    .toList();
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Member: Book a class
    @PostMapping("/member/{userId}/book/{sessionId}")
    public ResponseEntity<?> bookClass(@PathVariable UUID userId, @PathVariable UUID sessionId) {
        try {
            String status = schedulingService.bookClass(userId, sessionId);
            return ResponseEntity.ok(Map.of("message", "Class booked successfully.", "status", status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Member: Cancel a booking
    @PostMapping("/member/{userId}/cancel/{sessionId}")
    public ResponseEntity<?> cancelClass(@PathVariable UUID userId, @PathVariable UUID sessionId) {
        try {
            schedulingService.cancelClass(userId, sessionId);
            return ResponseEntity.ok(Map.of("message", "Class cancelled successfully."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin: Reassign a trainer to a specific session via assign_trainer() stored
    // function.
    // Validates trainer role, updates class_sessions.trainer_id, and upserts
    // commission.
    @PostMapping("/admin/assign-trainer")
    public ResponseEntity<?> assignTrainer(@RequestBody Map<String, String> request) {
        try {
            String sessionId = request.get("sessionId");
            String trainerId = request.get("trainerId");

            String resultJson = classSessionRepository.callAssignTrainer(sessionId, trainerId);

            JsonNode result = new ObjectMapper().readTree(resultJson);
            if (!result.get("success").asBoolean()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", result.get("error").asText()));
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Trainer assigned successfully.",
                    "hoursWorked", result.get("hoursWorked").asDouble(),
                    "commissionAmount", result.get("commissionAmount").asDouble()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Trainer: Fetch own commission records and total earnings.
    @GetMapping("/trainer/{trainerId}/commissions")
    public ResponseEntity<?> getTrainerCommissions(@PathVariable UUID trainerId) {
        try {
            List<TrainerCommission> commissions = trainerCommissionRepository
                    .findByTrainerIdOrderByCalculatedAtDesc(trainerId);
            BigDecimal total = trainerCommissionRepository.getTotalCommissionByTrainerId(trainerId);
            return ResponseEntity.ok(Map.of(
                    "commissions", commissions,
                    "total", total != null ? total : BigDecimal.ZERO));
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

    // Trainer: View participants for a class session
    @GetMapping("/trainer/{trainerId}/classes/{sessionId}/participants")
    public ResponseEntity<?> getClassParticipants(@PathVariable UUID trainerId, @PathVariable UUID sessionId) {
        try {
            ClassSession session = classSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new IllegalArgumentException("Session not found"));
            
            LocalDateTime sessionTime = session.getStartTime();

            // Find all active subscriptions that cover the session time
            List<Map<String, Object>> participants = subscriptionRepository.findAll().stream()
                    .filter(s -> "ACTIVE".equals(s.getStatus()))
                    .filter(s -> s.getStartDate() != null && s.getEndDate() != null)
                    .filter(s -> !sessionTime.isBefore(s.getStartDate()) && !sessionTime.isAfter(s.getEndDate()))
                    .map(s -> {
                        User user = s.getUser();
                        Map<String, Object> m = new HashMap<>();
                        m.put("id", user.getId());
                        m.put("firstName", user.getFirstName());
                        m.put("lastName", user.getLastName());
                        m.put("photoUrl", user.getProfilePhotoPath() != null
                                ? "http://localhost:8080" + user.getProfilePhotoPath()
                                : "");
                        return m;
                    })
                    // Distinct by user ID to avoid duplicates if someone has multiple plans
                    .filter(distinctByKey(m -> (UUID) m.get("id")))
                    .toList();

            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Helper for distinctBy
    private static <T> java.util.function.Predicate<T> distinctByKey(java.util.function.Function<? super T, ?> keyExtractor) {
        java.util.Set<Object> seen = java.util.concurrent.ConcurrentHashMap.newKeySet();
        return t -> seen.add(keyExtractor.apply(t));
    }

    // Trainer: Mark attendance
    @PostMapping("/trainer/{trainerId}/classes/{sessionId}/attendance")
    public ResponseEntity<?> markAttendance(
            @PathVariable UUID trainerId,
            @PathVariable UUID sessionId,
            @RequestBody Map<String, String> request) {
        try {
            UUID memberId = UUID.fromString(request.get("memberId"));
            String status = request.get("status");
            schedulingService.markAttendance(trainerId, sessionId, memberId, status);
            return ResponseEntity.ok(Map.of("message", "Attendance marked as " + status));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Staff: Get all class sessions for today with trainer info
    @GetMapping("/staff/today-classes")
    public ResponseEntity<?> getTodayClasses() {
        try {
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);

            List<Map<String, Object>> result = classSessionRepository.findAll().stream()
                    .filter(s -> s.getStartTime() != null
                            && !s.getStartTime().isBefore(startOfDay)
                            && !s.getStartTime().isAfter(endOfDay))
                    .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                    .map(s -> {
                        Map<String, Object> m = new HashMap<>();
                        m.put("sessionId", s.getId());
                        m.put("sessionName", s.getName());
                        m.put("startTime", s.getStartTime());
                        m.put("endTime", s.getEndTime());
                        m.put("room", s.getRoom() != null ? s.getRoom().getName() : "");
                        m.put("trainerId", s.getTrainer() != null ? s.getTrainer().getId() : null);
                        m.put("trainerName", s.getTrainer() != null
                                ? s.getTrainer().getFirstName() + " " + s.getTrainer().getLastName()
                                : "Unassigned");
                        m.put("trainerHourlyRate",
                                s.getTrainer() != null && s.getTrainer().getHourlyRate() != null
                                        ? s.getTrainer().getHourlyRate()
                                        : BigDecimal.ZERO);
                        return m;
                    })
                    .toList();

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Staff: Mark a trainer as present for a session — computes and saves allowance
    @PostMapping("/staff/mark-trainer-attendance")
    public ResponseEntity<?> markTrainerAttendance(@RequestBody Map<String, String> request) {
        try {
            UUID sessionId = UUID.fromString(request.get("sessionId"));
            UUID trainerId = UUID.fromString(request.get("trainerId"));

            var session = classSessionRepository.findById(sessionId)
                    .orElseThrow(() -> new IllegalArgumentException("Session not found"));
            var trainer = userRepository.findById(trainerId)
                    .orElseThrow(() -> new IllegalArgumentException("Trainer not found"));

            // Check if commission already exists for this session+trainer
            boolean alreadyMarked = trainerCommissionRepository.findAll().stream()
                    .anyMatch(c -> c.getTrainerId().equals(trainerId) && c.getSessionId().equals(sessionId));
            if (alreadyMarked) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Attendance already marked for this trainer and session."));
            }

            // Calculate hours worked from session start/end
            Duration duration = Duration.between(session.getStartTime(), session.getEndTime());
            BigDecimal hoursWorked = BigDecimal.valueOf(duration.toMinutes())
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

            BigDecimal ratePerHour = trainer.getHourlyRate() != null ? trainer.getHourlyRate() : BigDecimal.ZERO;
            BigDecimal commissionAmount = hoursWorked.multiply(ratePerHour);

            TrainerCommission commission = TrainerCommission.builder()
                    .trainerId(trainerId)
                    .sessionId(sessionId)
                    .hoursWorked(hoursWorked)
                    .ratePerHour(ratePerHour)
                    .commissionAmount(commissionAmount)
                    .build();
            trainerCommissionRepository.save(commission);

            return ResponseEntity.ok(Map.of(
                    "message", "Attendance marked. Allowance added.",
                    "trainerName", trainer.getFirstName() + " " + trainer.getLastName(),
                    "hoursWorked", hoursWorked,
                    "ratePerHour", ratePerHour,
                    "commissionAmount", commissionAmount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}