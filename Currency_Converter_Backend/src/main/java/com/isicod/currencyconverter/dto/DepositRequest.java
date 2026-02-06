package com.isicod.currencyconverter.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class DepositRequest {
    private BigDecimal amount;
    private String currency; 
}