import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <div class="welcome-section">
        <h2>Welcome to Admin Dashboard</h2>
        <p>Manage your currency converter application from one place</p>
      </div>

      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-details">
            <h3>{{ stats.totalUsers }}</h3>
            <p>Total Users</p>
            <span class="stat-trend positive">+{{ stats.activeUsers }} active</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💳</div>
          <div class="stat-details">
            <h3>{{ stats.totalTransactions }}</h3>
            <p>Transactions</p>
            <span class="stat-trend">{{ stats.todayTransactions }} today</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-details">
            <h3>{{ stats.totalBalance | currency:'MAD' }}</h3>
            <p>Total Balance</p>
            <span class="stat-trend">All accounts</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-details">
            <h3>{{ getConversionRate() }}%</h3>
            <p>Conversion Rate</p>
            <span class="stat-trend positive">Last 30 days</span>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <div class="section-header">
          <h3>Recent Activity</h3>
          <button class="btn-view-all">View All</button>
        </div>

        <div class="activity-list">
          <div class="activity-item" *ngFor="let activity of recentActivities">
            <div class="activity-icon">{{ activity.icon }}</div>
            <div class="activity-details">
              <div class="activity-title">{{ activity.title }}</div>
              <div class="activity-time">{{ activity.time }}</div>
            </div>
            <div class="activity-status" [class]="activity.status">
              {{ activity.status }}
            </div>
          </div>
        </div>
      </div>

      <div class="quick-actions">
        <h3>Quick Actions</h3>
        <div class="actions-grid">
          <button class="action-btn" routerLink="/admin/users">
            <i class="icon">👥</i>
            <span>Manage Users</span>
          </button>
          <button class="action-btn" routerLink="/admin/transactions">
            <i class="icon">💳</i>
            <span>View Transactions</span>
          </button>
          <button class="action-btn">
            <i class="icon">📊</i>
            <span>Generate Reports</span>
          </button>
          <button class="action-btn">
            <i class="icon">⚙️</i>
            <span>System Settings</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1400px;
      margin: 0 auto;
    }

    .welcome-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      margin-bottom: 30px;
    }

    .welcome-section h2 {
      margin: 0 0 10px 0;
      font-size: 2rem;
    }

    .welcome-section p {
      margin: 0;
      opacity: 0.9;
    }

    .quick-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.3s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-icon {
      font-size: 2.5rem;
      width: 70px;
      height: 70px;
      background: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-details h3 {
      margin: 0 0 5px 0;
      font-size: 1.8rem;
      color: #2c3e50;
    }

    .stat-details p {
      margin: 0 0 8px 0;
      color: #7f8c8d;
      font-size: 0.9rem;
    }

    .stat-trend {
      font-size: 0.8rem;
      padding: 3px 10px;
      border-radius: 12px;
      background: #f8f9fa;
    }

    .stat-trend.positive {
      background: #d4edda;
      color: #155724;
    }

    .recent-activity {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 30px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .btn-view-all {
      background: #3498db;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 6px;
      cursor: pointer;
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .activity-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 15px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
    }

    .activity-icon {
      font-size: 1.5rem;
      width: 45px;
      height: 45px;
      background: #f8f9fa;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .activity-details {
      flex: 1;
    }

    .activity-title {
      font-weight: 500;
      color: #2c3e50;
    }

    .activity-time {
      font-size: 0.85rem;
      color: #7f8c8d;
    }

    .activity-status {
      padding: 5px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .activity-status.success {
      background: #d4edda;
      color: #155724;
    }

    .activity-status.pending {
      background: #fff3cd;
      color: #856404;
    }

    .activity-status.warning {
      background: #f8d7da;
      color: #721c24;
    }

    .quick-actions {
      background: white;
      border-radius: 12px;
      padding: 25px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }

    .quick-actions h3 {
      margin: 0 0 20px 0;
      color: #2c3e50;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .action-btn {
      background: #f8f9fa;
      border: 2px solid #e9ecef;
      border-radius: 10px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.3s;
    }

    .action-btn:hover {
      background: #3498db;
      color: white;
      border-color: #3498db;
      transform: translateY(-3px);
    }

    .action-btn .icon {
      font-size: 2rem;
    }

    .action-btn span {
      font-weight: 500;
    }
  `]
})
export class DashboardPageComponent implements OnInit {
  stats = {
    totalUsers: 0,
    totalTransactions: 0,
    totalBalance: 0,
    todayTransactions: 0,
    activeUsers: 0
  };

  recentActivities = [
    {
      icon: '👤',
      title: 'New user registered: John Doe',
      time: '10 minutes ago',
      status: 'success'
    },
    {
      icon: '💳',
      title: 'Transaction completed: USD to EUR',
      time: '25 minutes ago',
      status: 'success'
    },
    {
      icon: '⚠️',
      title: 'Failed login attempt detected',
      time: '1 hour ago',
      status: 'warning'
    },
    {
      icon: '📊',
      title: 'Daily report generated',
      time: '2 hours ago',
      status: 'success'
    },
    {
      icon: '🔄',
      title: 'Exchange rates updated',
      time: '3 hours ago',
      status: 'success'
    }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadStats();
  }

  loadStats() {
    this.adminService.getDashboardStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  getConversionRate(): number {
    // Simulate conversion rate calculation
    return 95.5;
  }
}
