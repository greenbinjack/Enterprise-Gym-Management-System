package com.gym.enterprise_system.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;
import java.util.Set;
import java.util.HashSet;

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
    private BigDecimal monthlyPrice;
    private Integer discountLevel; // percentage
    private String recurringDayOfWeek;
    private String recurringStartTime;
    private Integer durationMinutes;
    private UUID allocatedRoomId;
    private Integer allocatedSeats;
    private Boolean isActive;
    private String category;
    private UUID recurringGroupId;

    @Column(length = 1000)
    private String description;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "membership_plan_trainers", joinColumns = @JoinColumn(name = "plan_id"), inverseJoinColumns = @JoinColumn(name = "trainer_id"))
    private Set<User> trainers = new HashSet<>();
}