import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-headers',
  templateUrl: './headers.component.html',
  styleUrl: './headers.component.scss'
})
export class HeadersComponent {
  
  page: string = 'INVENTORY';

  menuItems = [
    { label: 'INVENTORY', route: 'inventory' },
    { label: 'SALES', route: 'sales' },
    { label: 'PARTIES', route: 'parties' },
    { label: 'PARTNERS', route: 'partners' },
    { label: 'REPORTS', route: 'reports' },
    { label: 'EXPENSES', route: 'expenses' }
  ];

  constructor(public router: Router) {}

  navigate(route: string) {
    this.router.navigate([route]);
  }
}
