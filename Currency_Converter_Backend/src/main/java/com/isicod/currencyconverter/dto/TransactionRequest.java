package com.isicod.currencyconverter.dto;



import com.isicod.currencyconverter.enums.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransactionRequest {
    private TransactionType type;
    private BigDecimal amount;
}