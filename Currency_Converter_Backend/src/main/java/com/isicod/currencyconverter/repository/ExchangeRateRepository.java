package com.isicod.currencyconverter.repository;

import com.isicod.currencyconverter.model.ExchangeRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ExchangeRateRepository extends JpaRepository<ExchangeRate, Long> {
    
    Optional<ExchangeRate> findByBaseCurrencyAndTargetCurrency(String base, String target);
    
    Optional<ExchangeRate> findByBaseCurrency(String baseCurrency);
    
    Optional<ExchangeRate> findByTargetCurrency(String targetCurrency);
    
    Optional<ExchangeRate> findByBaseCurrencyAndTargetCurrencyAndIsActiveTrue(
            String baseCurrency,
            String targetCurrency
    );
}