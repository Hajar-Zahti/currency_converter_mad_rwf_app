package com.isicod.currencyconverter.controller;



import com.isicod.currencyconverter.dto.ApiResponse;

import com.isicod.currencyconverter.dto.BankTransactionDTO;
import com.isicod.currencyconverter.dto.DepositRequest;
import com.isicod.currencyconverter.dto.TransactionDTO;
import com.isicod.currencyconverter.dto.TransactionWithBankDTO;
import com.isicod.currencyconverter.enums.TransactionType;
import com.isicod.currencyconverter.model.BankTransaction;
import com.isicod.currencyconverter.model.Transaction;
import com.isicod.currencyconverter.model.User;
import com.isicod.currencyconverter.repository.BankTransactionRepository;
import com.isicod.currencyconverter.repository.TransactionRepository;
import com.isicod.currencyconverter.repository.UserRepository;
import com.isicod.currencyconverter.service.ExportService;
import com.isicod.currencyconverter.service.TransactionService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") 
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final TransactionRepository transactionRepository;
    private final BankTransactionRepository bankTransactionRepository;
    private final TransactionService bankTransactionService;
    private final UserRepository userRepository;

    private final ExportService exportService;
    /**
     *  Détail d'une transaction par ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Transaction> getById(@PathVariable Long id) {
        return transactionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/my/export")
    public void exportTransactions(HttpServletResponse response, Authentication auth) throws IOException {
        String email = auth.getName();
        List<TransactionDTO> transactions = transactionService.getUserTransactionsDTO(email);

        response.setContentType("application/vnd.ms-excel");
        response.setHeader("Content-Disposition", "attachment; filename=transactions.xlsx");

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Transactions");

        Row header = sheet.createRow(0);
        header.createCell(0).setCellValue("Reference");
        header.createCell(1).setCellValue("Type");
        header.createCell(2).setCellValue("From");
        header.createCell(3).setCellValue("To");
        header.createCell(4).setCellValue("Amount");
        header.createCell(5).setCellValue("Final Amount");
        header.createCell(6).setCellValue("Date");

        int rowNum = 1;
        for (TransactionDTO t : transactions) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(t.getTransactionRef());
            row.createCell(1).setCellValue(t.getType().name());
            row.createCell(2).setCellValue(t.getFromCurrency());
            row.createCell(3).setCellValue(t.getToCurrency());
            row.createCell(4).setCellValue(t.getAmount().doubleValue());
            row.createCell(5).setCellValue(t.getFinalAmount().doubleValue());
            row.createCell(6).setCellValue(t.getCreatedAt().toString());
        }

        workbook.write(response.getOutputStream());
        workbook.close();
    }
    
    /**
     *  Effectuer une conversion
     * type = RWF_TO_MAD | MAD_TO_RWF
     */
    @PostMapping("/convert")
    public ResponseEntity<TransactionDTO> convert(
            @RequestParam TransactionType type,
            @RequestParam BigDecimal amount
    ) {
        Transaction transaction = transactionService.createTransaction(type, amount);
        return ResponseEntity.ok(transactionService.mapToDTO(transaction));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TransactionDTO>> myTransactions() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        List<Transaction> txs = transactionService.getUserTransactions(email);
        List<TransactionDTO> dtos = txs.stream()
                .map(transactionService::mapToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/my/full")
    public List<TransactionWithBankDTO> getUserTransactionsFull() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<Transaction> txs = transactionService.getUserTransactions(email);

        return txs.stream().map(tx -> {
            BankTransaction debit = bankTransactionRepository.findDebitByTransaction(tx).orElse(null);
            BankTransaction credit = bankTransactionRepository.findCreditByTransaction(tx).orElse(null);

            return TransactionWithBankDTO.builder()
                    .transaction(transactionService.mapToDTO(tx))    // TransactionDTO
                    .debit(debit != null ? mapToBankDTO(debit) : null)   // BankTransactionDTO
                    .credit(credit != null ? mapToBankDTO(credit) : null) // BankTransactionDTO
                    .build();
        }).collect(Collectors.toList());
    }

    // méthode pour transformer BankTransaction en DTO
    private BankTransactionDTO mapToBankDTO(BankTransaction bankTx) {
        return BankTransactionDTO.builder()
                .id(bankTx.getId())
                .amount(bankTx.getAmount())
                .entryType(bankTx.getEntryType().name())
                .balanceAfter(bankTx.getBalanceAfter())
                .transactionDate(bankTx.getTransactionDate())
                .build();
    }

    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse<String>> deposit(
            @RequestBody DepositRequest request,
            Authentication authentication
    ) {
        
        String email = authentication.getName();

        // Récupérer l'id
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Long userId = user.getId();

        // Appeler service
        transactionService.deposit(userId, request.getAmount(), request.getCurrency());

        return ResponseEntity.ok(ApiResponse.success(
                "Dépôt effectué avec succès",
                null
        ));
    }

    @GetMapping("/transactions/my/export")
    public ResponseEntity<byte[]> exportMyTransactions(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        List<BankTransaction> bankTxs = bankTransactionService.getBankTransactionsByUser(user.getEmail());
        List<BankTransactionDTO> transactions = bankTxs.stream()
            .map(bankTransactionService::mapToDTO)
            .toList();

        byte[] excelBytes = exportService.exportBankTransactions(transactions);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(excelBytes);
    }    
}
