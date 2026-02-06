package com.isicod.currencyconverter.repository;

import java.util.List;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.isicod.currencyconverter.model.*;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount , Long>{
	Optional<BankAccount> findByAccountNumber(String accountNumber);
	Optional<BankAccount> findByCurrency(String currency);
	List<BankAccount> findByBankName(String bankName);
	Optional<BankAccount> findByUserId(Long userId);
	
	// Cette méthode permet de récupérer le wallet d'un user pour une currency spécifique
    Optional<BankAccount> findByUserAndCurrency(User user, String currency);

    //  récupérer un compte par userId + currency
    Optional<BankAccount> findByUserIdAndCurrency(Long userId, String currency);
}
