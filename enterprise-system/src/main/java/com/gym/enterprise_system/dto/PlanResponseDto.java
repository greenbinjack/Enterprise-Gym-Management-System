package com.gym.enterprise_system.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PlanResponseDto(UUID id, String name, int tierLevel, java.math.BigDecimal monthlyPrice,
                java.math.BigDecimal yearlyPrice, int classLimitPerMonth, int ptSessionsPerMonth, String category) {
}