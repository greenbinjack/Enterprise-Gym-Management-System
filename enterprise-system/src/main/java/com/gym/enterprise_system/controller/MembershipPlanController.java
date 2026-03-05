package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.MembershipPlan;
import com.gym.enterprise_system.repository.MembershipPlanRepository;
import com.gym.enterprise_system.service.SchedulingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Arrays;
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
    private final SchedulingService schedulingService;

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

            if (request.get("recurringDaysOfWeek") != null) {
                List<String> daysList = (List<String>) request.get("recurringDaysOfWeek");
                plan.setRecurringDayOfWeek(String.join(",", daysList));
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

            // AUTO-GENERATE CLASS SESSIONS for CLASS_PACKAGE plans
            if ("CLASS_PACKAGE".equals(savedPlan.getCategory())
                    && savedPlan.getRecurringDayOfWeek() != null
                    && savedPlan.getRecurringStartTime() != null
                    && savedPlan.getAllocatedRoomId() != null
                    && savedPlan.getDurationMinutes() != null
                    && savedPlan.getAllocatedSeats() != null
                    && savedPlan.getTrainers() != null
                    && !savedPlan.getTrainers().isEmpty()) {

                List<String> daysList = Arrays.asList(savedPlan.getRecurringDayOfWeek().split(","));
                UUID primaryTrainerId = savedPlan.getTrainers().iterator().next().getId();
                int weeks = request.get("weeksToGenerate") != null
                        ? Integer.parseInt(request.get("weeksToGenerate").toString())
                        : 52;

                schedulingService.createClassBundle(
                        savedPlan.getName(),
                        daysList,
                        savedPlan.getRecurringStartTime(),
                        savedPlan.getDurationMinutes(),
                        weeks,
                        savedPlan.getAllocatedRoomId(),
                        primaryTrainerId,
                        savedPlan.getAllocatedSeats());
            }

            return ResponseEntity.ok(Map.of("message", "Membership Plan created successfully.", "plan", savedPlan));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error creating plan: " + e.getMessage()));
        }
    }
}