package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.TrainerCommission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Repository
public interface TrainerCommissionRepository extends JpaRepository<TrainerCommission, UUID> {

  List<TrainerCommission> findByTrainerIdOrderByCalculatedAtDesc(UUID trainerId);

  @Query("SELECT SUM(tc.commissionAmount) FROM TrainerCommission tc WHERE tc.trainerId = :trainerId")
  BigDecimal getTotalCommissionByTrainerId(@Param("trainerId") UUID trainerId);
}
