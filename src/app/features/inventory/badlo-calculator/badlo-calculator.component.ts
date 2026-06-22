import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-badlo-calculator',
  templateUrl: './badlo-calculator.component.html',
  styleUrl: './badlo-calculator.component.scss'
})
export class BadloCalculatorComponent {
  @Input() isBadloEnabled = false;
  @Input() hasBadloItems = false;
  @Input() badloData: any; // Receives structural map containing Chorsa configurations

  @Output() isBadloEnabledChange = new EventEmitter<boolean>();
  @Output() triggerCalculation = new EventEmitter<void>();

  Math = Math;

  // Safe helper implementation to allow Object looping in Angular HTML structural templates
  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  formatNum(v: any) { 
    return v === null || v === undefined ? '' : v === 0 ? '0' : v.toString(); 
  }
  
  parseNum(v: string) { 
    return parseFloat(v.replace(/,/g, '')) || 0; 
  }
  
  fmtINR(v: number) { 
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v); 
  }
}