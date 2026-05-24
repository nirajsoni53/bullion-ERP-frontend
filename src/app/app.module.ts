import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { UsersComponent } from './users/users.component';
import { HeadersComponent } from './headers/headers.component';
import { InventoryComponent } from './features/inventory/inventory.component';
import { SalesComponent } from './features/sales/sales.component';
import { PartiesComponent } from './features/parties/parties.component';
import { PartnersComponent } from './features/partners/partners.component';
import { ReportsComponent } from './features/reports/reports.component';
import { ExpensesComponent } from './features/expenses/expenses.component';
import { PaginationFooterComponent } from './common-components/pagination-footer/pagination-footer.component';
import { BulkActionToolbarComponent } from './common-components/bulk-action-toolbar/bulk-action-toolbar.component';
import { InventoryToolbarComponent } from './features/inventory/inventory-toolbar/inventory-toolbar.component';
import { PartiesHeaderComponent } from './features/parties/parties-header/parties-header.component';
import { PartyTableComponent } from './features/parties/party-table/party-table.component';
import { PartyFormComponent } from './features/parties/party-form/party-form.component';
import { DeleteConfirmationComponent } from './features/parties/delete-confirmation/delete-confirmation.component';
import { StockEntryModalComponent } from './features/inventory/stock-entry-modal/stock-entry-modal.component';
import { PartyOrderInfoComponent } from './features/inventory/party-order-info/party-order-info.component';
import { LiveSummaryComponent } from './features/inventory/live-summary/live-summary.component';
import { ItemEntryComponent } from './features/inventory/item-entry/item-entry.component';
import { BadloCalculatorComponent } from './features/inventory/badlo-calculator/badlo-calculator.component';
import { SettlementPaymentComponent } from './features/inventory/settlement-payment/settlement-payment.component';
import { SettlementModalComponent } from './features/parties/settlement-modal/settlement-modal.component';

@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    HeadersComponent,
    InventoryComponent,
    SalesComponent,
    PartiesComponent,
    PartnersComponent,
    ReportsComponent,
    ExpensesComponent,
    PaginationFooterComponent,
    BulkActionToolbarComponent,
    InventoryToolbarComponent,
    PartiesHeaderComponent,
    PartyTableComponent,
    PartyFormComponent,
    DeleteConfirmationComponent,
    StockEntryModalComponent,
    PartyOrderInfoComponent,
    LiveSummaryComponent,
    ItemEntryComponent,
    BadloCalculatorComponent,
    SettlementPaymentComponent,
    SettlementModalComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
