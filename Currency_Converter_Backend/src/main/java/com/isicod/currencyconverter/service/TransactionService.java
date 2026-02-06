package com.isicod.currencyconverter.service;

import com.isicod.currencyconverter.dto.BankTransactionDTO;
import com.isicod.currencyconverter.dto.TransactionDTO;
import com.isicod.currencyconverter.enums.EntryType;
import com.isicod.currencyconverter.enums.TransactionStatus;
import com.isicod.currencyconverter.enums.TransactionType;
import com.isicod.currencyconverter.model.BankAccount;
import com.isicod.currencyconverter.model.BankTransaction;
import com.isicod.currencyconverter.model.ExchangeRate;
import com.isicod.currencyconverter.model.Transaction;
import com.isicod.currencyconverter.model.User;
import com.isicod.currencyconverter.repository.BankAccountRepository;
import com.isicod.currencyconverter.repository.BankTransactionRepository;
import com.isicod.currencyconverter.repository.TransactionRepository;
import com.isicod.currencyconverter.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final ExchangeRateService exchangeRateService;
    private final UserRepository userRepository;
    private final BankAccountRepository bankAccountRepository; 
    private final BankTransactionRepository bankTransactionRepository;
    /**
     * Création d'une transaction de change
     */
    public Transaction createTransaction(
            TransactionType type,
            BigDecimal amount
    ) {
        // Récupérer l'utilisateur connecté (JWT)
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Déterminer les devises
        String fromCurrency;
        String toCurrency;

        if (type == TransactionType.RWF_TO_MAD) {
            fromCurrency = "RWF";
            toCurrency = "MAD";
        } else {
            fromCurrency = "MAD";
            toCurrency = "RWF";
        }

        // Récupérer le taux Google (calculé)
        ExchangeRate rate = exchangeRateService.getOrUpdateRate(fromCurrency, toCurrency);

        // Appliquer les règles métier
        BigDecimal finalAmount;
        if (type == TransactionType.RWF_TO_MAD) {
            finalAmount = amount.multiply(rate.getGoogleRate());
        } else {
            BigDecimal googleValue = amount.multiply(rate.getGoogleRate());
            BigDecimal discount = new BigDecimal("15");
            finalAmount = googleValue.subtract(discount);
        }
        finalAmount = finalAmount.setScale(6, RoundingMode.HALF_UP);

        // Créer la transaction principale
        Transaction transaction = new Transaction();
        transaction.setTransactionRef(generateReference());
        transaction.setUser(user);
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setFromCurrency(fromCurrency);
        transaction.setToCurrency(toCurrency);
        transaction.setExchangeRate(rate.getGoogleRate());
        transaction.setFinalAmount(finalAmount);
        transaction.setStatus(TransactionStatus.COMPLETED);
        transaction.setCreatedAt(LocalDateTime.now());
        transaction.setCompletedAt(LocalDateTime.now());

        Transaction savedTransaction = transactionRepository.save(transaction);

        BankAccount fromAccount = bankAccountRepository
                .findByUserIdAndCurrency(user.getId(), fromCurrency)
                .orElseThrow(() -> new RuntimeException("Compte source introuvable"));

        BankAccount toAccount = bankAccountRepository
                .findByUserIdAndCurrency(user.getId(), toCurrency)
                .orElseThrow(() -> new RuntimeException("Compte destinataire introuvable"));

        // Vérifier solde
        if (fromAccount.getCurrentBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Solde insuffisant");
        }

        // Débit source
        fromAccount.setCurrentBalance(fromAccount.getCurrentBalance().subtract(amount));
        bankAccountRepository.save(fromAccount);

        // Crédit destination
        toAccount.setCurrentBalance(toAccount.getCurrentBalance().add(finalAmount));
        bankAccountRepository.save(toAccount);

        // Créer bankTransactions pour trace
        BankTransaction debitTx = new BankTransaction();
        debitTx.setBankAccount(fromAccount);
        debitTx.setAmount(amount);
        debitTx.setEntryType(EntryType.DEBIT);
        debitTx.setBalanceAfter(fromAccount.getCurrentBalance());
        debitTx.setTransactionDate(LocalDate.now());
        debitTx.setTransaction(savedTransaction);
        bankTransactionRepository.save(debitTx);

        BankTransaction creditTx = new BankTransaction();
        creditTx.setBankAccount(toAccount);
        creditTx.setAmount(finalAmount);
        creditTx.setEntryType(EntryType.CREDIT);
        creditTx.setBalanceAfter(toAccount.getCurrentBalance());
        creditTx.setTransactionDate(LocalDate.now());
        creditTx.setTransaction(savedTransaction);
        bankTransactionRepository.save(creditTx);

        return savedTransaction;
    }

    
    public TransactionDTO createTransactionDTO(
            TransactionType type,
            BigDecimal amount
    ) {
        Transaction tx = createTransaction(type, amount);
        return mapToDTO(tx);
    }


    /**
     * Génération d'une référence unique
     */
    private String generateReference() {
        return "TX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    public List<TransactionDTO> getUserTransactionsDTO(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return transactionRepository.findByUserId(user.getId())
                .stream()
                .map(this::mapToDTO)
                .toList();
    }
    

    public TransactionDTO mapToDTO(Transaction tx) {
        return TransactionDTO.builder()
                .id(tx.getId())
                .transactionRef(tx.getTransactionRef())
                .type(tx.getType())
                .amount(tx.getAmount())
                .fromCurrency(tx.getFromCurrency())
                .toCurrency(tx.getToCurrency())
                .exchangeRate(tx.getExchangeRate())
                .finalAmount(tx.getFinalAmount())
                .status(tx.getStatus())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    public List<Transaction> getUserTransactions(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return transactionRepository.findByUserId(user.getId());
    }


    public BankTransactionDTO mapToDTO(BankTransaction bankTx) {
        return BankTransactionDTO.builder()
            .id(bankTx.getId())
            .amount(bankTx.getAmount())
            .balanceAfter(bankTx.getBalanceAfter())
            .transactionDate(bankTx.getTransactionDate())
            .build();
    }

    
    public void deposit(Long userId, BigDecimal amount, String currency) {

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Montant invalide");
        }

        BankAccount account = bankAccountRepository
            .findByUserIdAndCurrency(userId, currency)
            .orElseThrow(() -> new RuntimeException("Compte introuvable"));

        BigDecimal newBalance = account.getCurrentBalance().add(amount);
        account.setCurrentBalance(newBalance);
        account.setLastSync(LocalDateTime.now());

        bankAccountRepository.save(account);

        BankTransaction tx = new BankTransaction();
        tx.setBankAccount(account);
        tx.setAmount(amount);
        tx.setEntryType(EntryType.CREDIT);
        tx.setTransactionDate(LocalDate.now());
        tx.setDescription("Dépôt utilisateur " + currency);
        tx.setBalanceAfter(newBalance);
        tx.setSyncTimestamp(LocalDateTime.now());

        bankTransactionRepository.save(tx);
    }
    
    public List<BankTransaction> getBankTransactionsByUser(String email) {
	    return bankTransactionRepository.findByBankAccountUserEmail(email);
	}
}
