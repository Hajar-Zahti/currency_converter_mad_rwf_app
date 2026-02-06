package com.isicod.currencyconverter.service;

import java.util.List;


import org.springframework.stereotype.Service;

import com.isicod.currencyconverter.dto.BankTransactionDTO;
import com.isicod.currencyconverter.model.BankTransaction;
import com.isicod.currencyconverter.repository.BankTransactionRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class BankTransactionService {

	private final BankTransactionRepository bankTransactionRepository;
	
	public BankTransactionDTO mapToDTO(BankTransaction bankTx) {
	    return BankTransactionDTO.builder()
	        .id(bankTx.getId())
	        .bankTransactionRef(bankTx.getBankTransactionRef())
	        .transactionRef(bankTx.getTransaction() != null ? bankTx.getTransaction().getTransactionRef() : null)
	        .description(bankTx.getDescription())
	        .amount(bankTx.getAmount())
	        .balanceAfter(bankTx.getBalanceAfter())
	        .transactionDate(bankTx.getTransactionDate())
	        .valueDate(bankTx.getValueDate())
	        .entryType(bankTx.getEntryType().name())
	        .currency(bankTx.getBankAccount().getCurrency())
	        .userFullName(bankTx.getBankAccount().getUser().getFullName())
	        .build();
	}

	public List<BankTransaction> getAllTransactions() {
	    return bankTransactionRepository.findAll();
	}
}
