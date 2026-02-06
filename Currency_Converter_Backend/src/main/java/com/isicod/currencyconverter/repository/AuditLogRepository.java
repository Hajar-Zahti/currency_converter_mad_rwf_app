package com.isicod.currencyconverter.repository;


import com.isicod.currencyconverter.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    List<AuditLog> findAllByOrderByCreatedAtDesc();
    
    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    List<AuditLog> findByUserEmailContainingIgnoreCaseOrderByCreatedAtDesc(String userEmail);
    
    List<AuditLog> findByActionTypeOrderByCreatedAtDesc(String actionType);
    
    List<AuditLog> findByEntityTypeOrderByCreatedAtDesc(String entityType);
    
    List<AuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    List<AuditLog> findByUserEmailContainingIgnoreCaseAndActionTypeAndEntityTypeOrderByCreatedAtDesc(
        String userEmail, String actionType, String entityType);
    
    long countByUserEmailIsNotNull();
    
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}