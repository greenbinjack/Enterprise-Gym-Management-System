package com.gym.enterprise_system.dto;

import lombok.*;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainerShiftDTO {
  private UUID id;
  private UUID trainerId;
  private String trainerName;
  private String shiftName;
  private String dayOfWeek;
  private LocalTime startTime;
  private LocalTime endTime;
}
