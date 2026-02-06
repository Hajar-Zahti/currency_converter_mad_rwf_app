// auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { StorageService } from '../../admin/storage.service';
import { ApiResponse, AuthResponse, LoginRequest } from '../../admin/interfaces/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private storageService: StorageService,
    private router: Router
  ) {
    this.checkAuthState();
  }

  private checkAuthState() {
    const token = this.storageService.getItem('token');
    this.isAuthenticatedSubject.next(!!token);
  }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${this.baseUrl}/login`,
      credentials
    ).pipe(
      tap(response => {
        console.log('AuthService - Full response:', response);

        if (response.success && response.data?.accessToken) {
          console.log('AuthService - Token received:', response.data.accessToken.substring(0, 30) + '...');

          // Stocker les données
          this.storageService.setItem('token', response.data.accessToken);
          this.storageService.setItem('refreshToken', response.data.refreshToken);

          if (response.data.user) {
            this.storageService.setItem('userEmail', response.data.user.email);
            this.storageService.setItem('userRole', response.data.user.role);
            this.storageService.setItem('userId', response.data.user.id.toString());
            this.storageService.setItem('userFullName', response.data.user.fullName);
          }

          this.isAuthenticatedSubject.next(true);

          console.log('AuthService - Attempting navigation to /admin/dashboard');

          // Navigation immédiate
          setTimeout(() => {
            this.router.navigate(['/admin/dashboard'])
              .then(success => {
                console.log(success ? 'Navigation successful' : 'Navigation failed');
                if (!success) {
                  console.log('Current URL:', window.location.href);
                }
              })
              .catch(err => {
                console.error('Navigation error:', err);
              });
          }, 100);
        } else {
          console.error(' No accessToken in response:', response);
        }
      }),
      catchError(error => {
        console.error(' AuthService - Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log(' AuthService - Logging out');

    const token = this.storageService.getItem('token');
    if (token) {
      this.http.post(`${this.baseUrl}/logout`, null, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => console.log('Backend logout successful'),
        error: (err) => console.warn('Backend logout error:', err)
      });
    }

    this.storageService.clear();
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/home']);
  }

  isLoggedIn(): boolean {
    const token = this.storageService.getItem('token');
    return !!token;
  }

  getToken(): string | null {
    return this.storageService.getItem('token');
  }

  getUserRole(): string | null {
    return this.storageService.getItem('userRole');
  }

  isAdmin(): boolean {
    const role = this.getUserRole();
    return role === 'ADMIN';
  }

  getCurrentUser(): any {
    return {
      id: this.storageService.getItem('userId'),
      email: this.storageService.getItem('userEmail'),
      fullName: this.storageService.getItem('userFullName'),
      role: this.getUserRole()
    };
  }
}
