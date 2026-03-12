package com.gym.enterprise_system.dto;

import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateTrainerShiftRequest {
  private String shiftName;
  private String dayOfWeek;
  private LocalTime startTime;
  private LocalTime endTime;
}
