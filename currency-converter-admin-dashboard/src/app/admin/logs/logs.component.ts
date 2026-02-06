import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.css'
})
export class LogsComponent implements OnInit {
  logs: any[] = [];
  allFilteredLogs: any[] = [];
  filteredLogs: any[] = [];
  selectedLog: any = null;

  searchTerm = '';
  actionTypeFilter = '';
  entityTypeFilter = '';
  dateFilter = '';
  sortBy = 'createdAt';
  sortOrder = 'desc';

  currentPage = 1;
  pageSize = 20;
  totalPages = 1;
  isLoading = false;

  // Nouvelles propriétés pour les statistiques
  stats = {
    totalLogs: 0,
    uniqueUsers: 0,
    todayLogs: 0,
    mostCommonAction: 'N/A'
  };

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadLogs();
    this.loadStats();
  }

  loadLogs() {
    this.isLoading = true;
    this.adminService.getAllAuditLogs().subscribe({
      next: (data) => {
        console.log('Audit logs loaded:', data);
        this.logs = data;
        this.filterLogs();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading audit logs:', err);
        this.isLoading = false;
      }
    });
  }

  loadStats() {
    this.adminService.getAuditLogStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        console.error('Error loading stats:', err);
      }
    });
  }

  filterLogs() {
    // Si on a des filtres, on utilise l'API de recherche
    if (this.searchTerm || this.actionTypeFilter || this.entityTypeFilter || this.dateFilter) {
      this.searchWithFilters();
    } else {
      // Sinon, on filtre localement
      this.filterLocally();
    }
  }

  searchWithFilters() {
    this.isLoading = true;

    const filters: any = {};
    if (this.searchTerm) filters.userEmail = this.searchTerm;
    if (this.actionTypeFilter) filters.actionType = this.actionTypeFilter;
    if (this.entityTypeFilter) filters.entityType = this.entityTypeFilter;
    if (this.dateFilter) filters.date = this.dateFilter;

    this.adminService.searchAuditLogs(filters).subscribe({
      next: (data) => {
        this.allFilteredLogs = this.sortLogs(data);
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error searching logs:', err);
        this.isLoading = false;
      }
    });
  }

  filterLocally() {
    let filtered = [...this.logs];

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(log =>
        log.userEmail?.toLowerCase().includes(term) ||
        log.actionType?.toLowerCase().includes(term) ||
        log.entityType?.toLowerCase().includes(term) ||
        log.ipAddress?.toLowerCase().includes(term)
      );
    }

    // Filter by action type
    if (this.actionTypeFilter) {
      filtered = filtered.filter(log => log.actionType === this.actionTypeFilter);
    }

    // Filter by entity type
    if (this.entityTypeFilter) {
      filtered = filtered.filter(log => log.entityType === this.entityTypeFilter);
    }

    // Filter by date
    if (this.dateFilter) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.createdAt).toISOString().split('T')[0];
        return logDate === this.dateFilter;
      });
    }

    this.allFilteredLogs = this.sortLogs(filtered);
    this.calculatePagination();
  }

  sortLogs(logs: any[]): any[] {
    return logs.sort((a, b) => {
      if (this.sortOrder === 'desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
    });
  }

  calculatePagination() {
    this.totalPages = Math.ceil(this.allFilteredLogs.length / this.pageSize);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredLogs = this.allFilteredLogs.slice(startIndex, endIndex);
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

  getStartIndex(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndIndex(): number {
    const end = this.currentPage * this.pageSize;
    return end > this.allFilteredLogs.length ? this.allFilteredLogs.length : end;
  }

  // Les getters pour les statistiques utilisent maintenant les données du serveur
  get uniqueUsersCount(): number {
    return this.stats.uniqueUsers || 0;
  }

  get todayLogsCount(): number {
    return this.stats.todayLogs || 0;
  }

  getMostCommonAction(): string {
    return this.stats.mostCommonAction || 'N/A';
  }

  getInitials(email: string): string {
    if (!email || email === 'System') return 'S';
    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase();
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR');
  }

  refreshLogs() {
    this.loadLogs();
    this.loadStats();
  }

  clearLogs() {
    if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      this.adminService.clearAuditLogs().subscribe({
        next: () => {
          this.loadLogs();
          this.loadStats();
        },
        error: (err) => {
          console.error('Error clearing logs:', err);
          alert('Failed to clear logs');
        }
      });
    }
  }

  exportLogs() {
    const dataToExport = this.allFilteredLogs.length > 0 ? this.allFilteredLogs : this.logs;
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  viewLogDetails(log: any) {
    this.selectedLog = log;
  }

  copyLogDetails(log: any) {
    const logText = `
Audit Log Details:
ID: ${log.id}
Timestamp: ${this.formatDateTime(log.createdAt)}
User: ${log.userEmail || 'System'}
Action: ${log.actionType}
Entity: ${log.entityType}
Entity ID: ${log.entityId || 'N/A'}
IP Address: ${log.ipAddress || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(logText).then(() => {
      alert('Log details copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  }

  resetFilters() {
    this.searchTerm = '';
    this.actionTypeFilter = '';
    this.entityTypeFilter = '';
    this.dateFilter = '';
    this.sortBy = 'createdAt';
    this.sortOrder = 'desc';
    this.currentPage = 1;
    this.filterLocally(); // Utiliser filterLocally au lieu de filterLogs pour éviter une nouvelle requête API
  }
}
