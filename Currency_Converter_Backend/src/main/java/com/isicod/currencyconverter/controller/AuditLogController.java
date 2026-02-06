package com.isicod.currencyconverter.controller;

import com.isicod.currencyconverter.model.AuditLog;
import com.isicod.currencyconverter.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AuditLogController {
    
    private final AuditLogService auditLogService;
    
    @GetMapping
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        List<AuditLog> logs = auditLogService.getAllLogs();
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/page")
    public ResponseEntity<Page<AuditLog>> getLogsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort sort = direction.equalsIgnoreCase("asc") 
            ? Sort.by(sortBy).ascending() 
            : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<AuditLog> logs = auditLogService.getLogsWithPagination(pageable);
        
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<AuditLog>> searchLogs(
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String date) {
        
        List<AuditLog> logs = auditLogService.searchLogs(userEmail, actionType, entityType, date);
        return ResponseEntity.ok(logs);
    }
    
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearAllLogs() {
        auditLogService.clearAllLogs();
        return ResponseEntity.ok(Map.of("message", "All logs cleared successfully"));
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getLogStatistics() {
        Map<String, Object> stats = auditLogService.getStatistics();
        return ResponseEntity.ok(stats);
    }
    
    @PostMapping
    public ResponseEntity<AuditLog> createLog(@RequestBody AuditLog auditLog) {
        AuditLog savedLog = auditLogService.saveLog(auditLog);
        return ResponseEntity.ok(savedLog);
    }
}