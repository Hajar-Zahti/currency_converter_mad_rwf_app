package com.isicod.currencyconverter.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    private String actionType;
    private String entityType;
    private Long entityId;
    private String userEmail;
    private String ipAddress;
    private LocalDateTime createdAt = LocalDateTime.now();
    
}
