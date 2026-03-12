package com.gym.enterprise_system.service.impl;

import com.gym.enterprise_system.entity.TrainerShift;
import com.gym.enterprise_system.entity.User;
import com.gym.enterprise_system.repository.TrainerShiftRepository;
import com.gym.enterprise_system.repository.UserRepository;
import com.gym.enterprise_system.service.TrainerShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class TrainerShiftServiceImpl implements TrainerShiftService {

  @Autowired
  private TrainerShiftRepository trainerShiftRepository;

  @Autowired
  private UserRepository userRepository;

  @Override
  public TrainerShift createShift(UUID trainerId, String shiftName, String dayOfWeek, LocalTime startTime,
      LocalTime endTime) {
    User trainer = userRepository.findById(trainerId)
        .orElseThrow(() -> new RuntimeException("Trainer not found with ID: " + trainerId));

    // Validate shift times
    if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
      throw new IllegalArgumentException("Invalid shift times: start time must be before end time");
    }

    TrainerShift shift = TrainerShift.builder()
        .trainer(trainer)
        .shiftName(shiftName)
        .dayOfWeek(dayOfWeek.toUpperCase())
        .startTime(startTime)
        .endTime(endTime)
        .build();

    return trainerShiftRepository.save(shift);
  }

  @Override
  public TrainerShift updateShift(UUID shiftId, String shiftName, String dayOfWeek, LocalTime startTime,
      LocalTime endTime) {
    TrainerShift shift = trainerShiftRepository.findById(shiftId)
        .orElseThrow(() -> new RuntimeException("Shift not found with ID: " + shiftId));

    // Validate shift times
    if (startTime == null || endTime == null || !startTime.isBefore(endTime)) {
      throw new IllegalArgumentException("Invalid shift times: start time must be before end time");
    }

    shift.setShiftName(shiftName);
    shift.setDayOfWeek(dayOfWeek.toUpperCase());
    shift.setStartTime(startTime);
    shift.setEndTime(endTime);

    return trainerShiftRepository.save(shift);
  }

  @Override
  public void deleteShift(UUID shiftId) {
    if (!trainerShiftRepository.existsById(shiftId)) {
      throw new RuntimeException("Shift not found with ID: " + shiftId);
    }
    trainerShiftRepository.deleteById(shiftId);
  }

  @Override
  public List<TrainerShift> getTrainerShifts(UUID trainerId) {
    if (!userRepository.existsById(trainerId)) {
      throw new RuntimeException("Trainer not found with ID: " + trainerId);
    }
    return trainerShiftRepository.findByTrainerId(trainerId);
  }

  @Override
  public List<TrainerShift> getTrainerShiftsByDay(UUID trainerId, String dayOfWeek) {
    if (!userRepository.existsById(trainerId)) {
      throw new RuntimeException("Trainer not found with ID: " + trainerId);
    }
    return trainerShiftRepository.findByTrainerIdAndDayOfWeek(trainerId, dayOfWeek.toUpperCase());
  }

  @Override
  public boolean isTrainerAvailable(UUID trainerId, String dayOfWeek, LocalTime startTime, LocalTime endTime) {
    List<TrainerShift> shifts = trainerShiftRepository.findOverlappingShifts(
        trainerId,
        dayOfWeek.toUpperCase(),
        startTime,
        endTime);
    // Trainer is available if they have at least one shift that covers the entire
    // time range
    return !shifts.isEmpty();
  }

  @Override
  public TrainerShift getShiftById(UUID shiftId) {
    return trainerShiftRepository.findById(shiftId)
        .orElseThrow(() -> new RuntimeException("Shift not found with ID: " + shiftId));
  }

  @Override
  public void deleteTrainerAllShifts(UUID trainerId) {
    if (!userRepository.existsById(trainerId)) {
      throw new RuntimeException("Trainer not found with ID: " + trainerId);
    }
    trainerShiftRepository.deleteByTrainerId(trainerId);
  }
}
