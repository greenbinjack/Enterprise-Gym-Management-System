package com.gym.enterprise_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "membership_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MembershipPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private Integer tierLevel;
    private BigDecimal monthlyPrice;
    private BigDecimal yearlyPrice;
    private Integer classLimitPerMonth;
    private Integer ptSessionsPerMonth;
    private Boolean isActive;
}