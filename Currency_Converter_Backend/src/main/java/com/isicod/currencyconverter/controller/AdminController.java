package com.isicod.currencyconverter.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.isicod.currencyconverter.dto.TransactionDTO;
import com.isicod.currencyconverter.model.AuditLog;
import com.isicod.currencyconverter.model.BankTransaction;
import com.isicod.currencyconverter.model.User;
import com.isicod.currencyconverter.repository.AuditLogRepository;
import com.isicod.currencyconverter.repository.BankTransactionRepository;
import com.isicod.currencyconverter.repository.TransactionRepository;
import com.isicod.currencyconverter.repository.UserRepository;
import com.isicod.currencyconverter.service.TransactionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin("*")
public class AdminController {

	private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final UserRepository userRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final AuditLogRepository auditLogRepository;



    @GetMapping("/all/transactions")
    public List<TransactionDTO> getAllTransactions() {
        return transactionRepository.findAll()
                .stream()
                .map(transactionService::mapToDTO)
                .toList();
    }
    

    @GetMapping("/all/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    

    @GetMapping("/logs")
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }
}




