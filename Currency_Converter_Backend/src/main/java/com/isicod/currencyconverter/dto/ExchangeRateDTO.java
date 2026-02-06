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
public class ExchangeRateDTO {
    private BigDecimal rwfToMadRate;         
    private BigDecimal madToRwfRate;         
    private BigDecimal madToRwfFinalRate;    
    private BigDecimal rwfToMadFinalRate;    
    private LocalDateTime lastUpdated;
    private String source = "Google Finance";
}