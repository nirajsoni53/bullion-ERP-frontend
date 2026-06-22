import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-item-entry',
  templateUrl: './item-entry.component.html',
  styleUrl: './item-entry.component.scss'
})
export class ItemEntryComponent {
  @Input() items: any[] = [];
  @Output() itemsChange = new EventEmitter<any[]>();
  @Output() listChanged = new EventEmitter<void>(); // Trigger for parent recalc

  currentItem = {
    grossWeight: null as number | null, 
    purity: null as number | null, 
    purityPaid: null as number | null, 
    rate: null as number | null,
    isBadloItem: false, 
    chorsa: '99', // Default Chorsa selection
    fineWeight: 0, 
    amount: 0
  };
  nextItemId = 1;
  Math = Math;

  calculateCurrentItem() {
    const gw = this.currentItem.grossWeight || 0;
    const purity = this.currentItem.purity || 0;
    const rate = this.currentItem.isBadloItem ? 0 : (this.currentItem.rate || 0);
    this.currentItem.fineWeight = gw * (purity / 100);
    const purityPaid = this.currentItem.purityPaid || purity;
    const paidWeight = gw * (purityPaid / 100);
    this.currentItem.amount = this.currentItem.isBadloItem ? 0 : (paidWeight / 1000) * rate;
  }

  addItem() {
    if (!this.currentItem.grossWeight || !this.currentItem.purity) return;
    if (!this.currentItem.isBadloItem && !this.currentItem.rate) return;

    const gw = this.currentItem.grossWeight;
    const purity = this.currentItem.purity;
    const purityPaid = this.currentItem.purityPaid || purity;
    const rate = this.currentItem.isBadloItem ? 0 : (this.currentItem.rate || 0);
    const actualFine = gw * (purity / 100);
    const paidFine = gw * (purityPaid / 100);
    let profitAmt = 0;
    let profitWt = 0;

    if (this.currentItem.isBadloItem) {
      profitWt = actualFine - paidFine;
      profitAmt = 0;
    } else {
      profitAmt = ((actualFine - paidFine) / 1000) * rate;
      profitWt = 0;
    }

    this.items.push({
      id: this.nextItemId++, 
      grossWeight: gw, 
      purity: purity, 
      purityPaid: this.currentItem.purityPaid || undefined,
      fineWeight: actualFine, 
      rate: rate, 
      amount: (paidFine / 1000) * rate,
      profitAmount: profitAmt, 
      profitWeight: profitWt, 
      isBadloItem: this.currentItem.isBadloItem,
      chorsa: this.currentItem.isBadloItem ? this.currentItem.chorsa : undefined // Saved if Badlo item
    });

    // Resetting currentItem setup
    this.currentItem = { 
      grossWeight: null, 
      purity: null, 
      purityPaid: null, 
      rate: null, 
      isBadloItem: false, 
      chorsa: '99', // Reset to default
      fineWeight: 0, 
      amount: 0 
    };
    this.listChanged.emit();
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.listChanged.emit();
  }

  formatNum(value: number | null | undefined): string {
    if (value === null || value === undefined) return ''; 
    if (value === 0) return '0';
    const parts = value.toString().split('.');
    const wholePart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';
    const lastThree = wholePart.substring(wholePart.length - 3);
    const otherNumbers = wholePart.substring(0, wholePart.length - 3);
    if (otherNumbers !== '') return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree + decimalPart;
    return lastThree + decimalPart;
  }

  parseNum(value: string): number {
    if (!value) return 0;
    const clean = value.replace(/,/g, '');
    const float = parseFloat(clean);
    return isNaN(float) ? 0 : float; // Fixed typo here (isNtaN -> isNaN)
  }

  fmtINR(v: number) { 
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v); 
  }
}