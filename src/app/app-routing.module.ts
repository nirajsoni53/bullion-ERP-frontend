import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


import { InventoryComponent } from './features/inventory/inventory.component';
import { SalesComponent } from './features/sales/sales.component';
import { PartiesComponent } from './features/parties/parties.component';
import { PartnersComponent } from './features/partners/partners.component';
import { ReportsComponent } from './features/reports/reports.component';
import { ExpensesComponent } from './features/expenses/expenses.component';

const routes: Routes = [
  { path: 'inventory', component: InventoryComponent },
  { path: 'sales', component: SalesComponent },
  { path: 'parties', component: PartiesComponent },
  { path: 'partners', component: PartnersComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'expenses', component: ExpensesComponent },

  { path: '', redirectTo: 'inventory', pathMatch: 'full' },
  { path: '**', redirectTo: 'inventory' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
