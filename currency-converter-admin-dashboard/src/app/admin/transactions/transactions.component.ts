import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit {
  allTransactions: any[] = [];
  allFilteredTransactions: any[] = [];
  filteredTransactions: any[] = [];
  selectedTransaction: any = null;

  searchTerm = '';
  typeFilter = '';
  statusFilter = '';
  dateFilter = '';

  currentPage = 1;
  pageSize = 15;
  totalPages = 1;
  isLoading = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadTransactions();
  }

  loadTransactions() {
    this.isLoading = true;
    this.adminService.getAllTransactionsWithUsers().subscribe({
      next: (data) => {
        console.log('Transactions loaded:', data);
        this.allTransactions = data;
        this.filterTransactions();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading transactions:', err);
        this.isLoading = false;
      }
    });
  }

  filterTransactions() {
    let filtered = [...this.allTransactions];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.transactionRef?.toLowerCase().includes(term) ||
        t.userName?.toLowerCase().includes(term) || // permettre la recherche par nom d'utilisateur
        t.userEmail?.toLowerCase().includes(term)   // permettre la recherche par email
      );
    }

    // Filter by type
    if (this.typeFilter) {
      filtered = filtered.filter(t => t.type === this.typeFilter);
    }

    // Filter by status
    if (this.statusFilter) {
      filtered = filtered.filter(t => t.status === this.statusFilter);
    }

    // Filter by date
    if (this.dateFilter) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.createdAt).toISOString().split('T')[0];
        return transactionDate === this.dateFilter;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Sauvegardez tous les résultats filtrés
    this.allFilteredTransactions = filtered;

    // Réinitialisez la page à 1 quand on filtre
    this.currentPage = 1;

    // Calculez la pagination
    this.calculatePagination();
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.allFilteredTransactions.length / this.pageSize);

    // Corrigez le calcul des indices
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.allFilteredTransactions.length);

    // Obtenez seulement la page courante
    this.filteredTransactions = this.allFilteredTransactions.slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.calculatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.calculatePagination();
    }
  }

  formatType(type: string): string {
    if (!type) return '';
    return type.replace(/_/g, ' → ');
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  }

  getInitials(name: string): string {
    if (!name || name === 'Unknown') return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  refreshTransactions() {
    this.loadTransactions();
  }

  viewTransactionDetails(transaction: any) {
    this.selectedTransaction = transaction;
  }

  // Méthode d'export pour une transaction individuelle
  exportTransaction(transaction: any) {
    const data = this.formatTransactionForExport(transaction);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-${transaction.transactionRef}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Méthode pour exporter toutes les transactions
  exportAllTransactions() {
    const data = this.formatTransactionsForExport(this.allTransactions);
    this.downloadFile(data, `all-transactions-${this.getCurrentDate()}.json`);
  }

  // Méthode pour exporter les transactions filtrées
  exportFilteredTransactions() {
    const data = this.formatTransactionsForExport(this.allFilteredTransactions);
    this.downloadFile(data, `filtered-transactions-${this.getCurrentDate()}.json`);
  }

  // Méthode pour formater une transaction individuelle
  private formatTransactionForExport(transaction: any): string {
    return `TRANSACTION DETAILS
========================
Reference: ${transaction.transactionRef}
Type: ${this.formatType(transaction.type)}
Status: ${transaction.status}
Date: ${this.formatDateTime(transaction.createdAt)}

EXCHANGE DETAILS
================
Amount: ${transaction.amount} ${transaction.fromCurrency}
Final Amount: ${transaction.finalAmount} ${transaction.toCurrency}
Exchange Rate: ${transaction.exchangeRate}
From Currency: ${transaction.fromCurrency}
To Currency: ${transaction.toCurrency}

USER INFORMATION
================
Name: ${transaction.userName || 'Unknown'}
Email: ${transaction.userEmail || 'N/A'}

ADDITIONAL INFO
===============
Created: ${this.formatDateTime(transaction.createdAt)}
Transaction ID: ${transaction.id}
`;
  }

  // Méthode pour formater plusieurs transactions
  private formatTransactionsForExport(transactions: any[]): string {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalTransactions: transactions.length,
      transactions: transactions.map(t => ({
        id: t.id,
        transactionRef: t.transactionRef,
        type: t.type,
        status: t.status,
        amount: t.amount,
        fromCurrency: t.fromCurrency,
        finalAmount: t.finalAmount,
        toCurrency: t.toCurrency,
        exchangeRate: t.exchangeRate,
        userName: t.userName,
        userEmail: t.userEmail,
        createdAt: t.createdAt,
        formattedDate: this.formatDateTime(t.createdAt)
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  // Méthode pour télécharger le fichier
  private downloadFile(data: string, filename: string) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  // Méthode pour obtenir la date actuelle formatée
  private getCurrentDate(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  }

  // Méthode d'export dans le modal
  exportTransactionDetails() {
    if (this.selectedTransaction) {
      this.exportTransaction(this.selectedTransaction);
    }
  }
}
