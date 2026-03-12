package com.gym.enterprise_system.service;

import com.gym.enterprise_system.entity.TrainerShift;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface TrainerShiftService {

  /**
   * Create a new trainer shift
   */
  TrainerShift createShift(UUID trainerId, String shiftName, String dayOfWeek, LocalTime startTime, LocalTime endTime);

  /**
   * Update an existing trainer shift
   */
  TrainerShift updateShift(UUID shiftId, String shiftName, String dayOfWeek, LocalTime startTime, LocalTime endTime);

  /**
   * Delete a trainer shift
   */
  void deleteShift(UUID shiftId);

  /**
   * Get all shifts for a trainer
   */
  List<TrainerShift> getTrainerShifts(UUID trainerId);

  /**
   * Get shifts for a trainer on a specific day
   */
  List<TrainerShift> getTrainerShiftsByDay(UUID trainerId, String dayOfWeek);

  /**
   * Validate if trainer can teach a class at given time
   */
  boolean isTrainerAvailable(UUID trainerId, String dayOfWeek, LocalTime startTime, LocalTime endTime);

  /**
   * Get shift by ID
   */
  TrainerShift getShiftById(UUID shiftId);

  /**
   * Delete all shifts for a trainer
   */
  void deleteTrainerAllShifts(UUID trainerId);
}
