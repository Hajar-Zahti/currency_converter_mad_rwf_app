package com.isicod.currencyconverter.dto;

import com.isicod.currencyconverter.enums.TransactionStatus;
import com.isicod.currencyconverter.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
    private Long id;
    private String transactionRef;
    private TransactionType type;        
    private BigDecimal amount;
    private String fromCurrency;
    private String toCurrency;
    private BigDecimal exchangeRate;
    private BigDecimal finalAmount;
    private TransactionStatus status;    
    private LocalDateTime createdAt;
}