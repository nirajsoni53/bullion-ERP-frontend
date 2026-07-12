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

  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  // Live typo-based formatting segregation layer
  onTypoInput(event: any, key: string, field: string) {
    let rawValue = event?.target?.value || '';
    const cleanValue = rawValue.replace(/,/g, '');
    const normalizedValue = parseFloat(cleanValue);

    if (isNaN(normalizedValue)) {
      this.badloData.chorsaVariants[key][field] = cleanValue === '' ? 0 : cleanValue;
      this.triggerCalculation.emit();
      return;
    }

    // Dynamic input formatting for currency-driven inputs: 'rate' & 'extraCharges'
    if (field === 'rate' || field === 'extraCharges') {
      const formatted = new Intl.NumberFormat('en-IN').format(Math.floor(normalizedValue));
      const suffix = rawValue.includes('.') ? rawValue.substring(rawValue.indexOf('.')) : '';
      event.target.value = formatted + (suffix.length <= 3 ? suffix : suffix.substring(0, 3)); 
    }

    this.badloData.chorsaVariants[key][field] = normalizedValue;
    this.triggerCalculation.emit();
  }

  handleFocus(event: any) {
    const rawValue = event.target.value.replace(/,/g, '');
    if (rawValue === '0' || rawValue === '0.00' || rawValue === '') {
      event.target.value = '';
    }
  }

  handleBlur(event: any, key: string, field: string) {
    const rawValue = (event?.target?.value || '').replace(/,/g, '');
    if (rawValue === '' || isNaN(parseFloat(rawValue))) {
      this.badloData.chorsaVariants[key][field] = 0;
      event.target.value = (field === 'rate' || field === 'extraCharges') ? '0' : '0.00';
    } else {
      const parsed = parseFloat(rawValue);
      this.badloData.chorsaVariants[key][field] = parsed % 1 === 0 ? parsed : Number(parsed.toFixed(2));
      
      if (field === 'rate' || field === 'extraCharges') {
        event.target.value = new Intl.NumberFormat('en-IN').format(this.badloData.chorsaVariants[key][field]);
      }
    }
    this.triggerCalculation.emit();
  }

  formatDisplayNum(v: any): string {
    if (v === null || v === undefined || v === '') return '0.00';
    const num = parseFloat(v);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  }

  formatCurrencyInitial(v: any): string {
    if (v === undefined || v === null || isNaN(parseFloat(v))) return '';
    return new Intl.NumberFormat('en-IN').format(parseFloat(v));
  }

  fmtINR(v: number) { 
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Math.round(v || 0)); 
  }
}