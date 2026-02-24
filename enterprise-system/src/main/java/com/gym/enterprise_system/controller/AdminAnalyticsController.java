package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.entity.Equipment;
import com.gym.enterprise_system.repository.AnalyticsRepository;
import com.gym.enterprise_system.repository.EquipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAnalyticsController {

        private final AnalyticsRepository analyticsRepository;
        private final EquipmentRepository equipmentRepository;

        @GetMapping("/dashboard")
        public ResponseEntity<?> getCommandCenterData() {
                // 1. Get complex metrics directly from PostgreSQL
                String metricsJson = analyticsRepository.getDashboardMetricsJson();

                // 2. Fetch ONLY broken equipment for the alerts panel
                List<Equipment> alerts = equipmentRepository.findAll().stream()
                                .filter(eq -> "NEEDS_MAINTENANCE".equals(eq.getStatus()))
                                .toList();

                return ResponseEntity.ok(Map.of(
                                "metrics", metricsJson,
                                "equipmentAlerts", alerts));
        }

}