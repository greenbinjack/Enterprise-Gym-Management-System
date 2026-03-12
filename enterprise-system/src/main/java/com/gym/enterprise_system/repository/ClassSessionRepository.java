package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.ClassSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ClassSessionRepository extends JpaRepository<ClassSession, UUID> {

        // MATHEMATICAL CAPACITY ENGINE: uses DB-side overlap function for room
        // capacity.
        @Query(value = "SELECT get_used_capacity_for_room_at_time(CAST(:roomId AS uuid), :startTime, :endTime)", nativeQuery = true)
        Integer getUsedCapacityForRoomAtTime(@Param("roomId") UUID roomId, @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        // TRAINER OVERLAP CHECK: uses DB-side overlap function for trainer schedule.
        @Query(value = "SELECT count_overlapping_trainer_classes(CAST(:trainerId AS uuid), :startTime, :endTime, NULL)", nativeQuery = true)
        long countOverlappingTrainerClasses(@Param("trainerId") UUID trainerId,
                        @Param("startTime") LocalDateTime startTime,
                        @Param("endTime") LocalDateTime endTime);

        @Query(value = "SELECT * FROM get_member_available_classes(CAST(:userId AS uuid))", nativeQuery = true)
        List<MemberAvailableClassProjection> getMemberAvailableClasses(@Param("userId") UUID userId);

        interface MemberAvailableClassProjection {
                UUID getSessionId();

                String getName();

                LocalDateTime getStartTime();

                LocalDateTime getEndTime();

                Integer getMaxCapacity();

                UUID getRoomId();

                String getRoomName();

                UUID getTrainerId();

                String getTrainerFirstName();

                String getTrainerLastName();

                Long getRemainingCapacity();
        }

        // Calls assign_trainer() stored function — validates trainer, updates the
        // session's trainer_id and upserts a commission record.
        @Query(value = "SELECT assign_trainer(CAST(:sessionId AS uuid), CAST(:trainerId AS uuid))", nativeQuery = true)
        String callAssignTrainer(@Param("sessionId") String sessionId, @Param("trainerId") String trainerId);
}