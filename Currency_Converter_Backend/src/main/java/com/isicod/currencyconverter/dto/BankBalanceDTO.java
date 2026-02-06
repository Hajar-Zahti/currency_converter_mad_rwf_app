package com.isicod.currencyconverter.dto;

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
public class BankBalanceDTO {
    private String bankName;
    private String accountNumber;
    private String currency;
    private BigDecimal currentBalance;
    private LocalDateTime lastSync;
}