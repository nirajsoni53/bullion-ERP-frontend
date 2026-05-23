import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-badlo-calculator',
  templateUrl: './badlo-calculator.component.html',
  styleUrl: './badlo-calculator.component.scss'
})
export class BadloCalculatorComponent {
  @Input() isBadloEnabled = false;
  @Input() hasBadloItems = false;
  @Input() badloData: any;

  @Output() isBadloEnabledChange = new EventEmitter<boolean>();
  @Output() triggerCalculation = new EventEmitter<void>();

  Math = Math;
  formatNum(v: any) { return v === null || v === undefined ? '' : v === 0 ? '0' : v.toString(); } // Simplfied for brevity, use Full Version in real code
  parseNum(v: string) { return parseFloat(v.replace(/,/g, '')) || 0; }
  fmtINR(v: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v); }
}
