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

  onEdit(e: Event, p: Party) { e.stopPropagation(); this.edit.emit(p); }
  onDelete(e: Event, p: Party) { e.stopPropagation(); this.delete.emit(p); }
  
  fmtINR(amount: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount); }
}
