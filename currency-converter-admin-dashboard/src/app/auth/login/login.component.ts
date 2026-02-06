// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = { email: 'admin@bank.com', password: 'admin123' };
  error = '';
  successMessage = '';
  isLoading = false;
  debugInfo = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.isLoading = true;
    this.error = '';
    this.successMessage = '';
    this.debugInfo = '';

    console.log('=== LOGIN START ===');

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('Login response received');

        if (response.success && response.data?.accessToken) {
          this.successMessage = 'Login successful! Redirecting...';

          // Stocker le token manuellement au cas où
          localStorage.setItem('token', response.data.accessToken);
          localStorage.setItem('userRole', response.data.user?.role || '');

          this.debugInfo = JSON.stringify(response, null, 2);

          // Méthode 1: Redirection forcée avec window.location
          setTimeout(() => {
            console.log('Attempting redirect to /admin/dashboard');
            window.location.href = '/admin/dashboard';
          }, 500);

        } else {
          this.error = 'Login failed: No token received';
          this.debugInfo = JSON.stringify(response, null, 2);
        }

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.error = err.error?.message || 'Login failed';
        this.debugInfo = JSON.stringify(err, null, 2);
        this.isLoading = false;
      }
    });
  }
}
