package com.isicod.currencyconverter.repository;

import com.isicod.currencyconverter.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    List<Transaction> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Optional<Transaction> findByTransactionRef(String transactionRef);
    
    List<Transaction> findByUserIdAndStatus(Long userId, com.isicod.currencyconverter.enums.TransactionStatus status);
    
    List<Transaction> findByCreatedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);
    
    List<Transaction> findByStatus(com.isicod.currencyconverter.enums.TransactionStatus status);
    
    List<Transaction> findByUserId(Long userId);
}