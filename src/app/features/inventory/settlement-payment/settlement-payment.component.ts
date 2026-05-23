import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-settlement-payment',
  templateUrl: './settlement-payment.component.html',
  styleUrl: './settlement-payment.component.scss'
})
export class SettlementPaymentComponent {
  @Input() enableItemSettlement = false;
  @Input() unsettledHistory: any[] = [];
  @Input() selectedParty: any;
  @Input() formData: any;
  
  @Input() totalSelectedPending = 0;
  @Input() netPayableFinal = 0;
  @Input() totalBillAmount = 0;
  @Input() totalSettlementSelected = 0;
  @Input() pendingBalanceFinal = 0;

  @Output() enableItemSettlementChange = new EventEmitter<boolean>();
  @Output() toggleSettlement = new EventEmitter<void>();
  @Output() toggleSelectAll = new EventEmitter<boolean>();
  @Output() itemSelect = new EventEmitter<any>();
  @Output() amountChange = new EventEmitter<void>();

  Math = Math;
  formatNum(v: any) { return v === null || v === undefined ? '' : v === 0 ? '0' : v.toString(); }
  parseNum(v: string) { return parseFloat(v.replace(/,/g, '')) || 0; }
  fmtINR(v: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v); }
}