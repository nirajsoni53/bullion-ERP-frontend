import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-headers',
  templateUrl: './headers.component.html',
  styleUrl: './headers.component.scss'
})
export class HeadersComponent {
  
  page: string = 'INVENTORY';
  bullionName: string = '';
  bullionLogo: string = '';

  menuItems = [
    { label: 'INVENTORY', route: 'inventory' },
    { label: 'SALES', route: 'sales' },
    { label: 'PARTIES', route: 'parties' },
    { label: 'PARTNERS', route: 'partners' },
    { label: 'REPORTS', route: 'reports' },
    { label: 'EXPENSES', route: 'expenses' },
    { label: 'SETTINGS', route: 'settings' }
  ];

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.loadHeaderBranding();
  }

  loadHeaderBranding(): void {
    const saved = localStorage.getItem('bullion_settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.bullionName = settings.name || '';
        this.bullionLogo = settings.logo || '';
      } catch (e) {
        console.error('Error parsing bullion settings', e);
      }
    }
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
