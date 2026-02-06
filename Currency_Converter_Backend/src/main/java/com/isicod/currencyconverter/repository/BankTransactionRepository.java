package com.isicod.currencyconverter.repository;

import com.isicod.currencyconverter.enums.EntryType;
import com.isicod.currencyconverter.model.BankTransaction;
import com.isicod.currencyconverter.model.Transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BankTransactionRepository extends JpaRepository<BankTransaction, Long> {
    
    List<BankTransaction> findByBankAccountId(Long accountId);
    
    List<BankTransaction> findByIsReconciledFalse();
    
    Optional<BankTransaction> findByTransactionId(Long transactionId);
    
    Optional<BankTransaction> findByBankTransactionRef(String ref);
    
 // Trouver le debit lié à une transaction
    Optional<BankTransaction> findByTransactionAndEntryType(Transaction transaction, EntryType entryType);

    default Optional<BankTransaction> findDebitByTransaction(Transaction transaction) {
        return findByTransactionAndEntryType(transaction, EntryType.DEBIT);
    }

    default Optional<BankTransaction> findCreditByTransaction(Transaction transaction) {
        return findByTransactionAndEntryType(transaction, EntryType.CREDIT);
    }
    List<BankTransaction> findByBankAccountUserEmail(String email);
}