// party-table.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Party } from '../party.service';

@Component({
  selector: 'app-party-table',
  templateUrl: './party-table.component.html',
  styleUrl: './party-table.component.scss'
})
export class PartyTableComponent {
  @Input() parties: Party[] = [];
  @Output() viewDetails = new EventEmitter<number>();
  @Output() edit = new EventEmitter<Party>();
  @Output() delete = new EventEmitter<Party>();
  @Output() settle = new EventEmitter<number>();

  onSettle(id: number, event: Event): void {
    event.stopPropagation();
    this.settle.emit(id);
  }

  onEdit(p: Party, event: Event): void {
    event.stopPropagation();
    this.edit.emit(p);
  }

  onDelete(p: Party, event: Event): void {
    event.stopPropagation();
    this.delete.emit(p);
  }
  
  // Safe formatting parsing logic to prevent NaN values
  fmtINR(amount: any): string {
    const val = parseFloat(amount);
    if (isNaN(val)) return '₹0';
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR', 
      maximumFractionDigits: 0 
    }).format(val); 
  }

  formatWeight(weight: any): string {
    const val = parseFloat(weight);
    if (isNaN(val) || val === 0) return '0.000 g';
    return `${val.toFixed(3)} g`;
  }

  // For Gold: Formats cleanly by separating weight and fine milligrams dynamically
  formatGoldUI(weightInGrams: any): { primary: string; mg: string; colorClass: string; sign: string } {
    const val = parseFloat(weightInGrams);
    if (isNaN(val) || val === 0) {
      return { primary: '0 g', mg: '000', colorClass: 'text-slate-400 font-medium', sign: '' };
    }

    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '+';
    
    // Premium Enterprise Dashboard Colors
    // Receivable (Lena) -> Rich Amber-Brown Badge
    // Payable (Dena) -> Rich Dark Crimson Red Badge
    const colorClass = val < 0 
      ? 'text-rose-900 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md shadow-3xs font-extrabold' 
      : 'text-amber-900 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md shadow-3xs font-extrabold'; 

    const mg = Math.round((absVal % 1) * 1000).toString().padStart(3, '0');
    const totalWholeGrams = Math.floor(absVal);

    if (totalWholeGrams >= 1000) {
      const kgs = Math.floor(totalWholeGrams / 1000);
      const grams = totalWholeGrams % 1000;
      return { primary: `${kgs} kg ${grams} g`, mg, colorClass, sign };
    }

    return { primary: `${totalWholeGrams} g`, mg, colorClass, sign };
  }

  // For Silver: Clean structural formatting (data parsing unchanged)
  formatSilverUI(weightInGrams: any): string {
    const val = parseFloat(weightInGrams);
    if (isNaN(val) || val === 0) return '0 g';

    const totalWholeGrams = Math.round(Math.abs(val)); 
    const sign = val < 0 ? '-' : '+';
    const formattedGrams = new Intl.NumberFormat('en-IN').format(totalWholeGrams);

    return `${sign}${formattedGrams} g`;
  }
}
