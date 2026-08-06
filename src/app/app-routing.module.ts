import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { SalesComponent } from './features/sales/sales.component';
import { PartiesComponent } from './features/parties/parties.component';
import { PartnersComponent } from './features/partners/partners.component';
import { ReportsComponent } from './features/reports/reports.component';
import { ExpensesComponent } from './features/expenses/expenses.component';
import { SettingsComponent } from './features/settings/settings.component';

import { AuthGuard } from './auth.guard';

const routes: Routes = [
  // Public Login Route
  { path: 'login', component: LoginComponent },

  // Protected Feature Routes
  { path: 'inventory', component: InventoryComponent, canActivate: [AuthGuard.canActivate] },
  { path: 'sales', component: SalesComponent, canActivate: [AuthGuard.canActivate] },
  { path: 'parties', component: PartiesComponent, canActivate: [AuthGuard.canActivate] },
  { path: 'partners', component: PartnersComponent, canActivate: [AuthGuard.canActivate] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard.canActivate] },
  { path: 'expenses', component: ExpensesComponent, canActivate: [AuthGuard.canActivate] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard.canActivate] },

  // Default & Fallback redirects to Login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }