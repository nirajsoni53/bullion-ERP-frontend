// parties-header.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-parties-header',
  templateUrl: 'parties-header.component.html'
})
export class PartiesHeaderComponent {
  @Input() totalItems = 0;
  @Input() searchTerm = '';
  @Input() balanceFilter: 'ALL' | 'RECEIVABLE' | 'PAYABLE' | 'SETTLED' = 'ALL';
  
  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<any>();
  @Output() addParty = new EventEmitter<void>();

  isBalanceMenuOpen = false;

  onSearch(term: string) {
    this.searchChange.emit(term);
  }

  toggleBalanceMenu() {
    this.isBalanceMenuOpen = !this.isBalanceMenuOpen;
  }

  selectFilter(filter: any) {
    this.filterChange.emit(filter);
    this.isBalanceMenuOpen = false;
  }
}
