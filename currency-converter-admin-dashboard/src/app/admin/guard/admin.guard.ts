import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/login/auth.service';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('adminGuard: Checking if user is admin...');
  console.log('adminGuard: User role:', authService.getUserRole());
  console.log('adminGuard: Is admin?', authService.isAdmin());

  if (!authService.isAdmin()) {
    console.log('adminGuard: User is not admin, redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  console.log('adminGuard: User is admin, allowing access');
  return true;
};
