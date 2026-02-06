package com.isicod.currencyconverter.service;

import com.isicod.currencyconverter.dto.BankTransactionDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExportService {

    public byte[] exportBankTransactions(List<BankTransactionDTO> transactions) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Bank Transactions");

            // Style pour l’en-tête
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            // En-têtes de colonnes
            String[] headers = {
                    "ID", "Transaction Ref", "Bank Ref", "Description", "Amount",
                    "Balance After", "Transaction Date", "Value Date",
                    "Entry Type", "Currency", "User Full Name"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Remplissage des lignes
            int rowIdx = 1;
            for (BankTransactionDTO tx : transactions) {
                Row row = sheet.createRow(rowIdx++);

                row.createCell(0).setCellValue(tx.getId());
                row.createCell(1).setCellValue(tx.getTransactionRef() != null ? tx.getTransactionRef() : "");
                row.createCell(2).setCellValue(tx.getBankTransactionRef() != null ? tx.getBankTransactionRef() : "");
                row.createCell(3).setCellValue(tx.getDescription() != null ? tx.getDescription() : "");
                row.createCell(4).setCellValue(tx.getAmount() != null ? tx.getAmount().doubleValue() : 0);
                row.createCell(5).setCellValue(tx.getBalanceAfter() != null ? tx.getBalanceAfter().doubleValue() : 0);
                row.createCell(6).setCellValue(tx.getTransactionDate() != null ? tx.getTransactionDate().toString() : "");
                row.createCell(7).setCellValue(tx.getValueDate() != null ? tx.getValueDate().toString() : "");
                row.createCell(8).setCellValue(tx.getEntryType() != null ? tx.getEntryType() : "");
                row.createCell(9).setCellValue(tx.getCurrency() != null ? tx.getCurrency() : "");
                row.createCell(10).setCellValue(tx.getUserFullName() != null ? tx.getUserFullName() : "");
            }

            // Auto-size colonnes
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Écriture en ByteArray pour réponse HTTP
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la génération de l'Excel", e);
        }
    }
}
