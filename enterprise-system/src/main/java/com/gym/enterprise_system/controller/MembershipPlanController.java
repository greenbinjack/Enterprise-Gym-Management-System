package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.MembershipPlan;
import com.gym.enterprise_system.repository.MembershipPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/membership-plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MembershipPlanController {

    private final MembershipPlanRepository planRepository;

    @GetMapping
    public ResponseEntity<List<MembershipPlan>> getAllPlans() {
        return ResponseEntity.ok(planRepository.findAll());
    }
}