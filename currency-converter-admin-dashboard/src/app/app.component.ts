import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  currentRoute = '';
  hasToken = false;
  showDebug = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
        this.hasToken = !!localStorage.getItem('token');
        console.log('Route changed to:', this.currentRoute);
      }
    });
  }

  ngOnInit() {
    console.log('App initialized');
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('User role:', localStorage.getItem('userRole'));
  }

  clearStorage() {
    localStorage.clear();
    window.location.reload();
  }
}
