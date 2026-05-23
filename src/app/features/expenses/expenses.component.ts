import { Component, Input  } from '@angular/core';

@Component({
  selector: 'app-expenses',
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {
  @Input() expenses: any[] = [];
  modals = { expense: false };

  fmtINR(amount: number | undefined) {
    return amount ? amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' }) : '₹0';
  }

  deleteExpense(id: number) {
    if (window.confirm('Delete?')) {
      this.expenses = this.expenses.filter(e => e.id !== id);
    }
  }
}
