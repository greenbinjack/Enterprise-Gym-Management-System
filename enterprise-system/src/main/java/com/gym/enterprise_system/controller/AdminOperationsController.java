package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.Equipment;
import com.gym.enterprise_system.entity.Room;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.EquipmentRepository;
import com.gym.enterprise_system.repository.RoomRepository;
import com.gym.enterprise_system.repository.SubscriptionRepository;
import com.gym.enterprise_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminOperationsController {

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final EquipmentRepository equipmentRepository;

    // --- FACILITY CONFIGURATION ---
    @PostMapping("/facilities/rooms")
    public ResponseEntity<?> addRoom(@RequestBody Room room) {
        if (room.getName() == null || room.getTotalCapacity() == null || room.getTotalCapacity() < 1) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid room data."));
        }
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.ok(savedRoom);
    }

    @GetMapping("/facilities/rooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        return ResponseEntity.ok(roomRepository.findAll());
    }

    // --- USER DIRECTORY & ROLE MANAGEMENT ---
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        var userDtos = userRepository.findAll().stream()
                // Filter out the ADMIN so they don't accidentally ban themselves!
                .filter(user -> "MEMBER".equals(user.getRole().name()))
                .map(user -> {
                    String status = "INACTIVE";

                    if (user.getIsActive() != null && !user.getIsActive()) {
                        status = "BANNED";
                    } else {
                        // Check if they have an active subscription
                        boolean hasActiveSub = subscriptionRepository.findByUserIdAndStatus(user.getId(), "ACTIVE")
                                .isPresent();
                        if (hasActiveSub) {
                            status = "ACTIVE";
                        }
                    }

                    // Using HashMap prevents the Java Generics crash!
                    java.util.Map<String, Object> dto = new java.util.HashMap<>();
                    dto.put("id", user.getId());
                    dto.put("firstName", user.getFirstName());
                    dto.put("lastName", user.getLastName());
                    dto.put("email", user.getEmail());
                    dto.put("role", user.getRole().name());
                    dto.put("adminStatus", status);

                    return dto;
                }).toList();

        return ResponseEntity.ok(userDtos);
    }

    @PutMapping("/users/{id}/toggle-status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable UUID id, @RequestBody Map<String, Boolean> request) {
        User user = userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Grab the boolean sent from React (true = restore, false = ban)
        Boolean makeActive = request.get("isActive");
        user.setIsActive(makeActive);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User status updated successfully."));
    }

    // NEW ENDPOINT for the Master Inventory Page
    @GetMapping("/equipment")
    public ResponseEntity<?> getAllEquipment() {
        return ResponseEntity.ok(equipmentRepository.findAll());
    }

    // Existing update equipment status endpoint
    @PutMapping("/equipment/{id}/status")
    public ResponseEntity<?> updateEquipmentStatus(@PathVariable UUID id,
            @RequestBody Map<String, String> request) {
        Equipment equipment = equipmentRepository.findById(id).orElseThrow();
        equipment.setStatus(request.get("status"));
        equipmentRepository.save(equipment);
        return ResponseEntity.ok(Map.of("message", "Updated to " + request.get("status")));
    }
}