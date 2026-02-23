package com.gym.enterprise_system.repository;

import com.gym.enterprise_system.entity.InvoicePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoicePaymentRepository extends JpaRepository<InvoicePayment, UUID> {
    Optional<InvoicePayment> findByTransactionId(String transactionId);
}