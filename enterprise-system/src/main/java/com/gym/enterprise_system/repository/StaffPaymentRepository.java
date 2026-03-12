package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.StaffPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface StaffPaymentRepository extends JpaRepository<StaffPayment, UUID> {
}
