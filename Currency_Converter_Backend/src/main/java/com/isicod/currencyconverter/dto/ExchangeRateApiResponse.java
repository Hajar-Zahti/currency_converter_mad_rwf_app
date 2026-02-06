package com.isicod.currencyconverter.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ExchangeRateApiResponse {
    @JsonProperty("success")
    private Boolean success;
    
    @JsonProperty("timestamp")
    private Long timestamp;
    
    @JsonProperty("base")
    private String base;
    
    @JsonProperty("date")
    private String date;
    
    @JsonProperty("rates")
    private Map<String, BigDecimal> rates;
}