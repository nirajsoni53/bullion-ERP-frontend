import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Party } from '../../parties/party.service';

@Component({
  selector: 'app-party-order-info',
  templateUrl: './party-order-info.component.html',
  styleUrl: './party-order-info.component.scss'
})
export class PartyOrderInfoComponent {
 @Input() formData: any;
  @Input() selectedParty: Party | null = null;
  @Input() filteredParties: Party[] = [];
  @Input() isSearchOpen = false;
  @Input() isDescriptionEditable = false; // Input for parent state

  @Output() search = new EventEmitter<string>();
  @Output() select = new EventEmitter<Party>();
  @Output() unselect = new EventEmitter<void>();
  @Output() addParty = new EventEmitter<void>();
  @Output() focusSearch = new EventEmitter<void>();
  @Output() isDescriptionEditableChange = new EventEmitter<boolean>(); // Output for two-way binding

  Math = Math;

  onSearchInput(event: any) {
    this.search.emit(event.target.value);
  }

  onFocus() {
    this.focusSearch.emit();
  }

  fmtINR(v: number) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  }
}
