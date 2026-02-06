package com.isicod.currencyconverter.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransactionWithBankDTO {
    private TransactionDTO transaction;
    private BankTransactionDTO debit;
    private BankTransactionDTO credit;
}