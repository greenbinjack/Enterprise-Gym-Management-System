package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.MembershipPlan;
import com.gym.enterprise_system.repository.MembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.UUID;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.UserRepository;

@RestController
@RequestMapping("/api/membership-plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MembershipPlanController {

    private final MembershipPlanRepository planRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<MembershipPlan>> getAllPlans() {
        return ResponseEntity.ok(planRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createPlan(@RequestBody Map<String, Object> request) {
        try {
            MembershipPlan plan = new MembershipPlan();
            plan.setName((String) request.get("name"));
            plan.setDescription((String) request.get("description"));

            if (request.get("monthlyPrice") != null) {
                plan.setMonthlyPrice(new BigDecimal(request.get("monthlyPrice").toString()));
            }

            // Handle new fields
            int discountLevel = 0;
            if (request.get("discountLevel") != null) {
                discountLevel = Integer.parseInt(request.get("discountLevel").toString());
            }
            plan.setDiscountLevel(discountLevel);

            if (request.get("recurringDayOfWeek") != null) {
                plan.setRecurringDayOfWeek((String) request.get("recurringDayOfWeek"));
            }
            if (request.get("recurringStartTime") != null) {
                plan.setRecurringStartTime((String) request.get("recurringStartTime"));
            }
            if (request.get("durationMinutes") != null) {
                plan.setDurationMinutes(Integer.parseInt(request.get("durationMinutes").toString()));
            }
            if (request.get("allocatedRoomId") != null && !request.get("allocatedRoomId").toString().isEmpty()) {
                plan.setAllocatedRoomId(UUID.fromString(request.get("allocatedRoomId").toString()));
            }
            if (request.get("allocatedSeats") != null) {
                plan.setAllocatedSeats(Integer.parseInt(request.get("allocatedSeats").toString()));
            }

            plan.setIsActive(true);
            plan.setCategory((String) request.get("category"));

            // Handle multiple trainers
            List<String> trainerIds = (List<String>) request.get("trainerIds");
            if (trainerIds != null && !trainerIds.isEmpty()) {
                Set<User> trainers = new HashSet<>();
                for (String id : trainerIds) {
                    userRepository.findById(UUID.fromString(id)).ifPresent(trainers::add);
                }
                plan.setTrainers(trainers);
            }

            MembershipPlan savedPlan = planRepository.save(plan);
            return ResponseEntity.ok(Map.of("message", "Membership Plan created successfully.", "plan", savedPlan));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error creating plan: " + e.getMessage()));
        }
    }
}