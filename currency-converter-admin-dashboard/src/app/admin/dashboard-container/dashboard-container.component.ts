import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../auth/login/auth.service';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-dashboard-container',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-container.component.html',
  styleUrls: ['./dashboard-container.component.css']
})
export class DashboardContainerComponent implements OnInit {
  isSidebarCollapsed = false;
  currentRoute = '';
  user: any = {};
  stats = {
    totalUsers: 0,
    totalTransactions: 0,
    todayTransactions: 0,
    totalBalance: 0,
    activeUsers: 0
  };

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
    private router: Router
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
    });
  }

  ngOnInit() {
    if (!this.authService.isLoggedIn() || !this.authService.isAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = this.authService.getCurrentUser();
    this.loadStats();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  getPageTitle(): string {
    if (this.currentRoute.includes('/admin/dashboard')) return 'Dashboard Overview';
    if (this.currentRoute.includes('/admin/transactions')) return 'Transactions Management';
    if (this.currentRoute.includes('/admin/users')) return 'User Management';
    if (this.currentRoute.includes('/admin/logs')) return 'System Logs';
    return 'Admin Panel';
  }

  loadStats() {
    this.adminService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
    }
  }
}
