package com.isicod.currencyconverter.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.isicod.currencyconverter.model.BankAccount;
import com.isicod.currencyconverter.model.User;
import com.isicod.currencyconverter.repository.BankAccountRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BankAccountService {

	private final BankAccountRepository bankAccountRepository;
	
	public void createDefaultAccounts(User user) {
	    // MAD Wallet
	    BankAccount madAccount = new BankAccount();
	    madAccount.setBankName("CIH Bank");
	    madAccount.setAccountHolder(user.getFullName());
	    madAccount.setAccountNumber("WALLET-MAD-" + user.getId());
	    madAccount.setCurrency("MAD");
	    madAccount.setCurrentBalance(BigDecimal.ZERO);
	    madAccount.setUser(user);
	    madAccount.setLastSync(LocalDateTime.now());
	    bankAccountRepository.save(madAccount);

	    // RWF Wallet
	    BankAccount rwfAccount = new BankAccount();
	    rwfAccount.setBankName("Equity Bank Rwanda Ltd");
	    rwfAccount.setAccountHolder(user.getFullName());
	    rwfAccount.setAccountNumber("WALLET-RWF-" + user.getId());
	    rwfAccount.setCurrency("RWF");
	    rwfAccount.setCurrentBalance(BigDecimal.ZERO);
	    rwfAccount.setUser(user);
	    rwfAccount.setLastSync(LocalDateTime.now());
	    bankAccountRepository.save(rwfAccount);
	}


}
