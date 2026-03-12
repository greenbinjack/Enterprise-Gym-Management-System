package com.gym.enterprise_system.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "trainer_shifts", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "trainer_id", "day_of_week", "start_time" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerShift {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "trainer_id", nullable = false)
  private User trainer;

  @Column(name = "shift_name", nullable = false)
  private String shiftName;

  @Column(name = "day_of_week", nullable = false)
  private String dayOfWeek; // MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY

  @Column(name = "start_time", nullable = false)
  private LocalTime startTime;

  @Column(name = "end_time", nullable = false)
  private LocalTime endTime;

  @CreationTimestamp
  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  // Validation helper
  public boolean isValidShift() {
    return startTime != null && endTime != null && startTime.isBefore(endTime);
  }

  // Check if a given time falls within this shift
  public boolean containsTime(LocalTime time) {
    if (time == null)
      return false;
    return !time.isBefore(startTime) && time.isBefore(endTime);
  }

  // Check if a time range falls within this shift
  public boolean containsTimeRange(LocalTime start, LocalTime end) {
    if (start == null || end == null)
      return false;
    return !start.isBefore(startTime) && !end.isAfter(endTime);
  }
}
