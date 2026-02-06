package com.isicod.currencyconverter.service;

import com.isicod.currencyconverter.model.ExchangeRate;
import com.isicod.currencyconverter.repository.ExchangeRateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

@Service // Service métier pour la gestion des taux de change
@RequiredArgsConstructor
public class ExchangeRateService {

    // Client HTTP pour appeler l’API externe
    private final RestTemplate restTemplate;
    
    // Repository pour persister les taux en base
    private final ExchangeRateRepository exchangeRateRepository;

    // URL de l’API de taux de change
    private static final String API_URL =
        "http://api.exchangerate.host/live?access_key=8467cf3a93c0a182cfdf143be8fd8b29";

    public ExchangeRate getOrUpdateRate(String from, String to) {

        // Appel à l’API externe
        Map response = restTemplate.getForObject(API_URL, Map.class);
        Map<String, Object> quotes = (Map<String, Object>) response.get("quotes");

        // Récupération des taux USD → MAD et USD → RWF
        BigDecimal usdToMad = new BigDecimal(quotes.get("USDMAD").toString());
        BigDecimal usdToRwf = new BigDecimal(quotes.get("USDRWF").toString());

        BigDecimal googleRate;

        // Calcul du taux RWF → MAD
        if (from.equals("RWF") && to.equals("MAD")) {
            googleRate = usdToMad.divide(usdToRwf, 6, RoundingMode.HALF_UP);
        } 
        // Calcul du taux MAD → RWF
        else if (from.equals("MAD") && to.equals("RWF")) {
            googleRate = usdToRwf.divide(usdToMad, 6, RoundingMode.HALF_UP);
        } 
        // Conversion non prise en charge
        else {
            throw new IllegalArgumentException("Conversion non supportée");
        }

        // Sauvegarde du taux calculé en base de données
        ExchangeRate rate = new ExchangeRate(from, to, googleRate);
        return exchangeRateRepository.save(rate);
    }
}
