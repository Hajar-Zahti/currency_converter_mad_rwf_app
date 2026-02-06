import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, of, map, forkJoin } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:8080/api/admin';

  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.storageService.getItem('token');
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }

  // ========== USERS ==========
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all/users`, {
      headers: this.getHeaders()
    }).pipe(
      map(users => {
        return users.map(user => ({
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          phoneNumber: user.phoneNumber,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin,
          accountCount: user.bankAccounts?.length || 0,
          transactionCount: user.transactions?.length || 0,
          totalBalance: this.calculateTotalBalance(user.bankAccounts),
          bankAccounts: user.bankAccounts || [],
          transactions: user.transactions || []
        }));
      }),
      catchError(error => {
        console.error('Error fetching users:', error);
        return of(this.getMockUsers());
      })
    );
  }

  // ========== TRANSACTIONS ==========
  getAllTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/all/transactions`, {
      headers: this.getHeaders()
    }).pipe(
      map(transactions => {
        return transactions.map(transaction => ({
          id: transaction.id,
          transactionRef: transaction.transactionRef,
          type: transaction.type,
          amount: transaction.amount,
          finalAmount: transaction.finalAmount,
          fromCurrency: transaction.fromCurrency,
          toCurrency: transaction.toCurrency,
          exchangeRate: transaction.exchangeRate,
          status: transaction.status,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt || transaction.createdAt,
          isReconciled: transaction.isReconciled || false,
          userId: transaction.userId || transaction.user?.id,
          userName: transaction.userName || transaction.user?.fullName || transaction.user?.email || 'Unknown'
        }));
      }),
      catchError(error => {
        console.error('Error fetching transactions:', error);
        return of(this.getMockTransactions());
      })
    );
  }

  // ========== TRANSACTIONS WITH USER INFO ==========
  getAllTransactionsWithUsers(): Observable<any[]> {
  return forkJoin({
    transactions: this.getAllTransactions().pipe(
      catchError(error => {
        console.error('Error fetching transactions:', error);
        return of([]);
      })
    ),
    users: this.getAllUsers().pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    )
  }).pipe(
    map(({ transactions, users }) => {
      const usersMap = new Map<number, any>();

      // Créez une Map des utilisateurs par ID
      users.forEach(user => {
        if (user && user.id) {
          usersMap.set(user.id, user);
        }
      });

      // Associez chaque transaction avec son utilisateur
      return transactions.map(transaction => {
        // Vérifiez si transaction et userId existent
        if (!transaction || transaction.userId === undefined || transaction.userId === null) {
          return {
            ...transaction,
            userName: 'Unknown',
            userEmail: 'N/A',
            userRole: 'N/A'
          };
        }

        const user = usersMap.get(transaction.userId);

        return {
          ...transaction,
          userName: user ? (user.fullName || user.name || user.email?.split('@')[0] || 'Unknown') : 'Unknown',
          userEmail: user ? user.email : 'N/A',
          userRole: user ? user.role : 'N/A',
          // Gardez une référence à l'objet utilisateur complet si nécessaire
          user: user || null
        };
      });
    }),
    catchError(error => {
      console.error('Error in getAllTransactionsWithUsers:', error);
      return this.getAllTransactions().pipe(
        map(transactions => transactions.map(transaction => ({
          ...transaction,
          userName: 'Unknown',
          userEmail: 'N/A',
          userRole: 'N/A'
        }))),
        catchError(() => of([])) // Retournez un tableau vide en dernier recours
      );
    })
  );
}

  // ========== LOGS ==========
  getAllLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/logs`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching logs:', error);
        return of(this.getMockLogs());
      })
    );
  }

  // ========== DASHBOARD STATS ==========
  getDashboardStats(): Observable<any> {
    return forkJoin({
      users: this.getAllUsers(),
      transactions: this.getAllTransactions()
    }).pipe(
      map(({ users, transactions }) => {
        const today = new Date().toISOString().split('T')[0];
        const todayTransactions = transactions.filter((t: any) =>
          t.createdAt?.startsWith(today)
        ).length;

        const totalBalance = users.reduce((total: number, user: any) =>
          total + (user.totalBalance || 0), 0
        );

        return {
          totalUsers: users.length,
          totalTransactions: transactions.length,
          todayTransactions: todayTransactions,
          totalBalance: totalBalance,
          activeUsers: users.filter((u: any) => u.isActive).length,
          pendingTransactions: transactions.filter((t: any) =>
            t.status !== 'COMPLETED'
          ).length
        };
      }),
      catchError(error => {
        console.error('Error calculating stats:', error);
        return of(this.getMockStats());
      })
    );
  }

  // ========== UTILITIES ==========
  private calculateTotalBalance(bankAccounts: any[]): number {
    if (!bankAccounts || bankAccounts.length === 0) {
      return 0;
    }
    return bankAccounts.reduce((total, account) => {
      return total + (account.currentBalance || 0);
    }, 0);
  }


  // ========== MOCK DATA ==========
  private getMockUsers() {
    return [
      {
        id: 1,
        email: 'admin@bank.com',
        fullName: 'Admin User',
        phoneNumber: '0606317283',
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        accountCount: 0,
        transactionCount: 0,
        totalBalance: 0,
        bankAccounts: []
      }
    ];
  }

  private getMockTransactions() {
    return [
      {
        id: 1,
        transactionRef: 'TX-TEST-001',
        type: 'MAD_TO_RWF',
        amount: 100,
        finalAmount: 15895.45,
        fromCurrency: 'MAD',
        toCurrency: 'RWF',
        exchangeRate: 158.9545,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        isReconciled: true,
        userId: 1,
        userName: 'Test User'
      }
    ];
  }

  private getMockLogs() {
    return [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        level: 'INFO',
        source: 'AdminService',
        message: 'System started',
        user: 'admin@bank.com'
      }
    ];
  }

  private getMockStats() {
    return {
      totalUsers: 3,
      totalTransactions: 45,
      todayTransactions: 5,
      totalBalance: 44.73,
      activeUsers: 3,
      pendingTransactions: 0
    };
  }

  // ========== AUDIT LOGS ==========
  getAllAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/audit-logs`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching audit logs:', error);
        return of([]);
      })
    );
  }

  searchAuditLogs(filters: {
    userEmail?: string;
    actionType?: string;
    entityType?: string;
    date?: string;
  }): Observable<any[]> {
    let params = new HttpParams();

    if (filters.userEmail) params = params.set('userEmail', filters.userEmail);
    if (filters.actionType) params = params.set('actionType', filters.actionType);
    if (filters.entityType) params = params.set('entityType', filters.entityType);
    if (filters.date) params = params.set('date', filters.date);

    return this.http.get<any[]>(`${this.baseUrl}/audit-logs/search`, {
      headers: this.getHeaders(),
      params: params
    }).pipe(
      catchError(error => {
        console.error('Error searching audit logs:', error);
        return of([]);
      })
    );
  }

  getAuditLogStats(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/audit-logs/stats`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error fetching audit log stats:', error);
        return of({
          totalLogs: 0,
          uniqueUsers: 0,
          todayLogs: 0,
          mostCommonAction: 'N/A'
        });
      })
    );
  }

  clearAuditLogs(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/audit-logs/clear`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        console.error('Error clearing audit logs:', error);
        return of({ success: false, message: 'Failed to clear logs' });
      })
    );
  }


}
