package com.gym.enterprise_system.dto;

import java.util.UUID;

public record CheckoutPreviewRequestDto(UUID userId, UUID planId, String billingCycle) {
}
