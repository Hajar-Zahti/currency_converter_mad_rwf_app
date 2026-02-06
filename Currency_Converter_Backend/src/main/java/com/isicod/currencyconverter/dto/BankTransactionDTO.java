package com.isicod.currencyconverter.dto;

import java.math.BigDecimal;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder 
@NoArgsConstructor
@AllArgsConstructor
public class BankTransactionDTO {

	 private Long id;
	    private String bankTransactionRef; 
	    private String transactionRef;     
	    private String description;
	    private BigDecimal amount;
	    private BigDecimal balanceAfter;
	    private LocalDate transactionDate;
	    private LocalDate valueDate;
	    private String entryType;
	    private String currency;           
	    private String userFullName;  
}
