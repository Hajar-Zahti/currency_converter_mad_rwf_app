package com.isicod.currencyconverter.service;

import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;

import com.isicod.currencyconverter.model.AuditLog;
import com.isicod.currencyconverter.model.Transaction;
import com.isicod.currencyconverter.model.User;
import com.isicod.currencyconverter.repository.AuditLogRepository;

import jakarta.transaction.Transactional;

@Service 
public class AuditLogService {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    public void logTransaction(User user, String action, Transaction transaction) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setUserEmail(user.getEmail());
        log.setActionType("TRANSACTION_" + action);
        log.setEntityType("Transaction");
        log.setEntityId(transaction.getId());
        log.setIpAddress(getClientIp());
        log.setCreatedAt(LocalDateTime.now());
        
        auditLogRepository.save(log);
    }
    
    public void logUserAction(User user, String action, String details) {
        AuditLog log = new AuditLog();
        log.setUser(user);
        log.setUserEmail(user.getEmail());
        log.setActionType("USER_" + action);
        log.setEntityType("User");
        log.setEntityId(user.getId());
        log.setIpAddress(getClientIp());
        log.setCreatedAt(LocalDateTime.now());
        
        auditLogRepository.save(log);
    }
    
    private String getClientIp() {
        return "127.0.0.1"; 
    }
    
    
    
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc();
    }
    
    public Page<AuditLog> getLogsWithPagination(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
    
    public List<AuditLog> searchLogs(String userEmail, String actionType, String entityType, String date) {
        List<AuditLog> logs;
        
        if (userEmail != null && !userEmail.isEmpty() && 
            actionType != null && !actionType.isEmpty() && 
            entityType != null && !entityType.isEmpty() && 
            date != null && !date.isEmpty()) {
            
            // Recherche avec tous les filtres
            LocalDate searchDate = LocalDate.parse(date);
            LocalDateTime startOfDay = searchDate.atStartOfDay();
            LocalDateTime endOfDay = searchDate.atTime(LocalTime.MAX);
            logs = findByUserEmailAndActionTypeAndEntityTypeAndDate(userEmail, actionType, entityType, startOfDay, endOfDay);
            
        } else if (userEmail != null && !userEmail.isEmpty()) {
            logs = auditLogRepository.findByUserEmailContainingIgnoreCaseOrderByCreatedAtDesc(userEmail);
        } else if (actionType != null && !actionType.isEmpty()) {
            logs = auditLogRepository.findByActionTypeOrderByCreatedAtDesc(actionType);
        } else if (entityType != null && !entityType.isEmpty()) {
            logs = auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType);
        } else if (date != null && !date.isEmpty()) {
            LocalDate searchDate = LocalDate.parse(date);
            LocalDateTime startOfDay = searchDate.atStartOfDay();
            LocalDateTime endOfDay = searchDate.atTime(LocalTime.MAX);
            logs = auditLogRepository.findByCreatedAtBetweenOrderByCreatedAtDesc(startOfDay, endOfDay);
        } else {
            logs = getAllLogs();
        }
        
        return logs;
    }
    
    private List<AuditLog> findByUserEmailAndActionTypeAndEntityTypeAndDate(
            String userEmail, String actionType, String entityType, 
            LocalDateTime start, LocalDateTime end) {
        
        // Filtrage manuel pour cette combinaison spécifique
        List<AuditLog> logs = auditLogRepository.findByUserEmailContainingIgnoreCaseAndActionTypeAndEntityTypeOrderByCreatedAtDesc(
            userEmail, actionType, entityType);
        
        return logs.stream()
            .filter(log -> !log.getCreatedAt().isBefore(start) && !log.getCreatedAt().isAfter(end))
            .collect(Collectors.toList());
    }
    
    @Transactional
    public AuditLog saveLog(AuditLog auditLog) {
        return auditLogRepository.save(auditLog);
    }
    
    @Transactional
    public void clearAllLogs() {
        auditLogRepository.deleteAll();
    }
    
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap();
        List<AuditLog> allLogs = getAllLogs();
        
        // Total des logs
        stats.put("totalLogs", allLogs.size());
        
        // Nombre d'utilisateurs uniques
        long uniqueUsers = allLogs.stream()
            .map(AuditLog::getUserEmail)
            .filter(Objects::nonNull)
            .distinct()
            .count();
        stats.put("uniqueUsers", uniqueUsers);
        
        // Logs d'aujourd'hui
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        long todayLogs = auditLogRepository.countByCreatedAtBetween(startOfDay, endOfDay);
        stats.put("todayLogs", todayLogs);
        
        // Action la plus commune
        if (!allLogs.isEmpty()) {
            Map<String, Long> actionCounts = allLogs.stream()
                .filter(log -> log.getActionType() != null)
                .collect(Collectors.groupingBy(
                    AuditLog::getActionType,
                    Collectors.counting()
                ));
            
            String mostCommonAction = actionCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
            stats.put("mostCommonAction", mostCommonAction);
        } else {
            stats.put("mostCommonAction", "N/A");
        }
        
        return stats;
    }
    
    public AuditLog createAndSaveLog(String actionType, String entityType, Long entityId, 
                                     String userEmail, String ipAddress, User user) {
        AuditLog log = new AuditLog();
        log.setActionType(actionType);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setUserEmail(userEmail);
        log.setIpAddress(ipAddress);
        log.setUser(user);
        log.setCreatedAt(LocalDateTime.now());
        
        return auditLogRepository.save(log);
    }
}









