package com.gym.enterprise_system.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record PlanResponseDto(UUID id, String name, Integer tierLevel, BigDecimal monthlyPrice, BigDecimal yearlyPrice,
        Integer classLimit, Integer ptSessions) {
}