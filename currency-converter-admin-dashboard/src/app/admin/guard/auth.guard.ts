import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/login/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('authGuard: Checking if user is logged in...');
  console.log('authGuard: Token exists?', !!authService.getToken());
  console.log('authGuard: isLoggedIn?', authService.isLoggedIn());

  if (!authService.isLoggedIn()) {
    console.log('authGuard: User not logged in, redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  console.log('authGuard: User is logged in, allowing access');
  return true;
};
