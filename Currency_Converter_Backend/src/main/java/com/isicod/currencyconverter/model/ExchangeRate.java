package com.isicod.currencyconverter.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "exchange_rates")
@NoArgsConstructor
public class ExchangeRate {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String baseCurrency;           
    private String targetCurrency;            
    @Column(precision = 10, scale = 6)
    private BigDecimal googleRate;         
    
    @Column(precision = 10, scale = 6)
    private BigDecimal marginRwfToMad = BigDecimal.ZERO;    
    
    @Column(precision = 10, scale = 6)
    private BigDecimal discountMadToRwf = new BigDecimal("15"); 
    
    private LocalDateTime lastUpdated;
    private Boolean isActive = true;
    
    // Constructor
    public ExchangeRate(String baseCurrency, String targetCurrency, BigDecimal googleRate) {
        this.baseCurrency = baseCurrency;
        this.targetCurrency = targetCurrency;
        this.googleRate = googleRate;
        this.lastUpdated = LocalDateTime.now();
        this.isActive = true;
        
       
        if ("MAD".equals(baseCurrency) && "RWF".equals(targetCurrency)) {
            this.discountMadToRwf = new BigDecimal("15");
            this.marginRwfToMad = BigDecimal.ZERO;
        } else {
            this.discountMadToRwf = BigDecimal.ZERO;
            this.marginRwfToMad = BigDecimal.ZERO;
        }
    }
}