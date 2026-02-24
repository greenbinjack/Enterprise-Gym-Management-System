package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.dto.ApplicationRequestDto;
import com.gym.enterprise_system.service.TrainerRecruitmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruitment")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allows React to hit these endpoints
public class RecruitmentController {

    private final TrainerRecruitmentService recruitmentService;

    // Public Endpoint: Anyone can apply
    @PostMapping("/apply")
    public ResponseEntity<?> applyForTrainer(@Valid @RequestBody ApplicationRequestDto request) {
        try {
            recruitmentService.submitApplication(request);
            return ResponseEntity
                    .ok(Map.of("message", "Application submitted successfully! Our team will review it shortly."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin Endpoint: Get Kanban columns (PENDING, APPROVED, REJECTED)
    @GetMapping("/applications/{status}")
    public ResponseEntity<?> getApplications(@PathVariable String status) {
        return ResponseEntity.ok(recruitmentService.getApplicationsByStatus(status.toUpperCase()));
    }

    // Admin Endpoint: Approve and Migrate
    @PostMapping("/applications/{id}/approve")
    public ResponseEntity<?> approveApplication(@PathVariable UUID id) {
        try {
            recruitmentService.approveApplicant(id);
            return ResponseEntity.ok(Map.of("message", "Applicant approved and migrated to Users database."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Admin Endpoint: Reject
    @PostMapping("/applications/{id}/reject")
    public ResponseEntity<?> rejectApplication(@PathVariable UUID id) {
        try {
            recruitmentService.rejectApplicant(id);
            return ResponseEntity.ok(Map.of("message", "Applicant rejected."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // NEW: Get all 4 columns for the Kanban Board
    @GetMapping("/board")
    public ResponseEntity<?> getRecruitmentBoard() {
        return ResponseEntity.ok(recruitmentService.getRecruitmentBoardData());
    }

    // NEW: Move Rejected back to Pending
    @PostMapping("/applications/{id}/pending")
    public ResponseEntity<?> moveApplicationToPending(@PathVariable UUID id) {
        try {
            recruitmentService.moveApplicantToPending(id);
            return ResponseEntity.ok(Map.of("message", "Application moved back to review."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}