package com.gym.enterprise_system.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "trainer_commissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerCommission {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "trainer_id", nullable = false)
  private UUID trainerId;

  @Column(name = "session_id", nullable = false)
  private UUID sessionId;

  @Column(name = "hours_worked", nullable = false)
  private BigDecimal hoursWorked;

  @Column(name = "rate_per_hour", nullable = false)
  private BigDecimal ratePerHour;

  @Column(name = "commission_amount", nullable = false)
  private BigDecimal commissionAmount;

  @CreationTimestamp
  @Column(name = "calculated_at", updatable = false)
  private LocalDateTime calculatedAt;
}
