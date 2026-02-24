package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, UUID> {

    // MATHEMATICAL CAPACITY ENGINE: Sums the max_capacity of all classes running in
    // a specific room during a specific time window.
    @Query("SELECT COALESCE(SUM(c.maxCapacity), 0) FROM ClassSession c WHERE c.room.id = :roomId AND c.startTime < :endTime AND c.endTime > :startTime")
    Integer getUsedCapacityForRoomAtTime(@Param("roomId") UUID roomId, @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);

    // TRAINER OVERLAP CHECK: Counts if the trainer is already teaching ANY class
    // during this exact time window.
    @Query("SELECT COUNT(c) FROM ClassSession c WHERE c.trainer.id = :trainerId AND c.startTime < :endTime AND c.endTime > :startTime")
    long countOverlappingTrainerClasses(@Param("trainerId") UUID trainerId, @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}