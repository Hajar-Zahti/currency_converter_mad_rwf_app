package com.isicod.currencyconverter.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.isicod.currencyconverter.enums.TransactionStatus;
import com.isicod.currencyconverter.enums.TransactionType;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String transactionRef;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;
    
    @OneToMany(mappedBy = "transaction", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<BankTransaction> bankTransactions;

    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;
    
    private String fromCurrency;
    private String toCurrency;
    
    @Column(precision = 15, scale = 6)
    private BigDecimal finalAmount;

    @Column(precision = 15, scale = 6)
    private BigDecimal exchangeRate;

    @Column(precision = 15, scale = 6)
    private BigDecimal amount;

    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionStatus status = TransactionStatus.PENDING;
    
    private LocalDateTime createdAt;
    private LocalDateTime completedAt; 
    private Boolean isReconciled = false;
}