package com.gym.enterprise_system.controller;

import com.gym.enterprise_system.dto.CreateTrainerShiftRequest;
import com.gym.enterprise_system.dto.TrainerShiftDTO;
import com.gym.enterprise_system.entity.TrainerShift;
import com.gym.enterprise_system.service.TrainerShiftService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trainer-shifts")
public class TrainerShiftController {

  @Autowired
  private TrainerShiftService trainerShiftService;

  /**
   * Create a new trainer shift
   * Only admin can create shifts for trainers
   */
  @PostMapping("/{trainerId}")
  public ResponseEntity<TrainerShiftDTO> createShift(
      @PathVariable UUID trainerId,
      @RequestBody CreateTrainerShiftRequest request) {
    try {
      TrainerShift shift = trainerShiftService.createShift(
          trainerId,
          request.getShiftName(),
          request.getDayOfWeek(),
          request.getStartTime(),
          request.getEndTime());
      return ResponseEntity.status(HttpStatus.CREATED).body(convertToDTO(shift));
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Get all shifts for a trainer
   */
  @GetMapping("/{trainerId}")
  public ResponseEntity<List<TrainerShiftDTO>> getTrainerShifts(@PathVariable UUID trainerId) {
    try {
      List<TrainerShift> shifts = trainerShiftService.getTrainerShifts(trainerId);
      return ResponseEntity.ok(shifts.stream().map(this::convertToDTO).collect(Collectors.toList()));
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Get shifts for a specific day of week
   */
  @GetMapping("/{trainerId}/day/{dayOfWeek}")
  public ResponseEntity<List<TrainerShiftDTO>> getTrainerShiftsByDay(
      @PathVariable UUID trainerId,
      @PathVariable String dayOfWeek) {
    try {
      List<TrainerShift> shifts = trainerShiftService.getTrainerShiftsByDay(trainerId, dayOfWeek);
      return ResponseEntity.ok(shifts.stream().map(this::convertToDTO).collect(Collectors.toList()));
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Check if trainer is available at a specific time
   */
  @GetMapping("/{trainerId}/check-availability")
  public ResponseEntity<Boolean> checkAvailability(
      @PathVariable UUID trainerId,
      @RequestParam String dayOfWeek,
      @RequestParam String startTime,
      @RequestParam String endTime) {
    try {
      boolean isAvailable = trainerShiftService.isTrainerAvailable(
          trainerId,
          dayOfWeek,
          java.time.LocalTime.parse(startTime),
          java.time.LocalTime.parse(endTime));
      return ResponseEntity.ok(isAvailable);
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Update a trainer shift
   * Only admin can update shifts
   */
  @PutMapping("/{shiftId}")
  public ResponseEntity<TrainerShiftDTO> updateShift(
      @PathVariable UUID shiftId,
      @RequestBody CreateTrainerShiftRequest request) {
    try {
      TrainerShift shift = trainerShiftService.updateShift(
          shiftId,
          request.getShiftName(),
          request.getDayOfWeek(),
          request.getStartTime(),
          request.getEndTime());
      return ResponseEntity.ok(convertToDTO(shift));
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Delete a trainer shift
   * Only admin can delete shifts
   */
  @DeleteMapping("/{shiftId}")
  public ResponseEntity<Void> deleteShift(@PathVariable UUID shiftId) {
    try {
      trainerShiftService.deleteShift(shiftId);
      return ResponseEntity.noContent().build();
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Delete all shifts for a trainer
   * Only admin can delete trainer shifts
   */
  @DeleteMapping("/{trainerId}/all")
  public ResponseEntity<Void> deleteAllTrainerShifts(@PathVariable UUID trainerId) {
    try {
      trainerShiftService.deleteTrainerAllShifts(trainerId);
      return ResponseEntity.noContent().build();
    } catch (Exception e) {
      return ResponseEntity.badRequest().build();
    }
  }

  /**
   * Get a specific shift by ID
   */
  @GetMapping("/shift/{shiftId}")
  public ResponseEntity<TrainerShiftDTO> getShiftById(@PathVariable UUID shiftId) {
    try {
      TrainerShift shift = trainerShiftService.getShiftById(shiftId);
      return ResponseEntity.ok(convertToDTO(shift));
    } catch (Exception e) {
      return ResponseEntity.notFound().build();
    }
  }

  /**
   * Helper method to convert entity to DTO
   */
  private TrainerShiftDTO convertToDTO(TrainerShift shift) {
    return TrainerShiftDTO.builder()
        .id(shift.getId())
        .trainerId(shift.getTrainer().getId())
        .trainerName(shift.getTrainer().getFirstName() + " " + shift.getTrainer().getLastName())
        .shiftName(shift.getShiftName())
        .dayOfWeek(shift.getDayOfWeek())
        .startTime(shift.getStartTime())
        .endTime(shift.getEndTime())
        .build();
  }
}
