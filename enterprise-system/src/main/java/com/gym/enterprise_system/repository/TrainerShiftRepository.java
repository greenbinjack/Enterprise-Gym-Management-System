package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.TrainerShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TrainerShiftRepository extends JpaRepository<TrainerShift, UUID> {

  /**
   * Find all shifts for a specific trainer
   */
  List<TrainerShift> findByTrainerId(UUID trainerId);

  /**
   * Find shifts for a trainer on a specific day of week
   */
  List<TrainerShift> findByTrainerIdAndDayOfWeek(UUID trainerId, String dayOfWeek);

  /**
   * Check if trainer has any shift on a given day
   */
  boolean existsByTrainerIdAndDayOfWeek(UUID trainerId, String dayOfWeek);

  /**
   * Find a specific shift by trainer, day, and start time
   */
  Optional<TrainerShift> findByTrainerIdAndDayOfWeekAndStartTime(
      UUID trainerId,
      String dayOfWeek,
      LocalTime startTime);

  /**
   * Find all shifts for a trainer that overlap with a given time range on a
   * specific day
   */
  @Query("SELECT ts FROM TrainerShift ts " +
      "WHERE ts.trainer.id = :trainerId " +
      "AND ts.dayOfWeek = :dayOfWeek " +
      "AND ts.startTime <= :endTime " +
      "AND ts.endTime >= :startTime")
  List<TrainerShift> findOverlappingShifts(
      @Param("trainerId") UUID trainerId,
      @Param("dayOfWeek") String dayOfWeek,
      @Param("startTime") LocalTime startTime,
      @Param("endTime") LocalTime endTime);

  /**
   * Delete all shifts for a trainer
   */
  void deleteByTrainerId(UUID trainerId);
}
