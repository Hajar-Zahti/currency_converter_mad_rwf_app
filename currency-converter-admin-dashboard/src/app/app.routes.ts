import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { DashboardContainerComponent } from './admin/dashboard-container/dashboard-container.component';
import { TransactionsComponent } from './admin/transactions/transactions.component';
import { UsersComponent } from './admin/users/users.component';
import { LogsComponent } from './admin/logs/logs.component';
import { authGuard } from './admin/guard/auth.guard';
import { adminGuard } from './admin/guard/admin.guard';
import { DashboardPageComponent } from './admin/dashboard-page/dashboard-page.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  // Route par défaut vers Home
  {
    path: '',
    component: HomeComponent
  },

  // Route explicite pour Home
  {
    path: 'home',
    component: HomeComponent
  },

  // Route Login
  {
    path: 'login',
    component: LoginComponent
  },

  // Routes Admin (protégées)
  {
    path: 'admin',
    component: DashboardContainerComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent
      },
      {
        path: 'transactions',
        component: TransactionsComponent
      },
      {
        path: 'users',
        component: UsersComponent
      },
      {
        path: 'logs',
        component: LogsComponent
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Redirection pour les routes inconnues
  {
    path: '**',
    redirectTo: '' // Redirige vers HomeComponent
  }
];
