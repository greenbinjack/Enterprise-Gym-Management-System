package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.Equipment;
import com.gym.enterprise_system.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;

    /**
     * GET all equipment. Accessible by STAFF, ADMIN.
     */
    @GetMapping
    public ResponseEntity<List<Equipment>> getAllEquipment() {
        return ResponseEntity.ok(equipmentRepository.findAll());
    }

    /**
     * PUT - Update equipment status.
     * Accessible by STAFF and ADMIN.
     * Body: { "status": "NEEDS_MAINTENANCE" }
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateEquipmentStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> request) {

        String newStatus = request.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status is required."));
        }

        List<String> validStatuses = List.of("AVAILABLE", "NEEDS_MAINTENANCE", "RETIRED");
        if (!validStatuses.contains(newStatus.toUpperCase())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid status. Must be one of: " + validStatuses));
        }

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Equipment not found with ID: " + id));

        equipment.setStatus(newStatus.toUpperCase());
        equipmentRepository.save(equipment);

        return ResponseEntity.ok(Map.of(
                "message", "Equipment status updated to " + newStatus.toUpperCase(),
                "equipment", equipment));
    }
}
