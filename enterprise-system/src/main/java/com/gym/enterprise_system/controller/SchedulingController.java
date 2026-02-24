package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.Room;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.ClassSessionRepository;
import com.gym.enterprise_system.repository.RoomRepository;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.service.SchedulingService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @Autowired
    private final ClassSessionRepository classSessionRepository;

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

    // Trainer: View ONLY their assigned classes
    @GetMapping("/trainer/{trainerId}/classes")
    public ResponseEntity<?> getTrainerClasses(@PathVariable UUID trainerId) {
        return ResponseEntity.ok(classSessionRepository.findAll().stream()
                .filter(c -> c.getTrainer().getId().equals(trainerId))
                .sorted((a, b) -> a.getStartTime().compareTo(b.getStartTime()))
                .toList());
    }

    @PostMapping("/admin/check-availability")
    public ResponseEntity<?> checkAvailability(@RequestBody Map<String, Object> req) {
        try {
            return ResponseEntity.ok(schedulingService.getAvailableResources(
                    req.get("dayOfWeek").toString(),
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
            schedulingService.createClassBundle(
                    req.get("name").toString(),
                    req.get("dayOfWeek").toString(),
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

}