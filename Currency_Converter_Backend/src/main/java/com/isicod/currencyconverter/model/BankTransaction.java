package com.isicod.currencyconverter.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.isicod.currencyconverter.enums.EntryType;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "bank_transactions")
public class BankTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bank_account_id", nullable = false)
    @JsonIgnore
    private BankAccount bankAccount;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id",  nullable = true)
    @JsonIgnore
    private Transaction transaction;

    
    private String bankTransactionRef;
    private LocalDate transactionDate;
    private LocalDate valueDate;
    private String description;
    private BigDecimal amount;
    private BigDecimal balanceAfter;
    
    @Enumerated(EnumType.STRING)
    private EntryType entryType;
    
    private Boolean isReconciled = false;
    private LocalDateTime syncTimestamp;
}