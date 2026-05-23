import { Component, Input, Output, EventEmitter, SimpleChanges, OnChanges, HostListener, ElementRef } from '@angular/core';

@Component({
  selector: 'app-inventory-toolbar',
  templateUrl: './inventory-toolbar.component.html'
})
export class InventoryToolbarComponent implements OnChanges {
  
  // ... (Keep existing Inputs/Outputs same as before) ...
  @Input() page = 'INVENTORY';
  @Input() sections: string[] = [];
  @Input() activeSection = '';
  @Input() theme = 'blue';
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();
  @Input() statusFilter = 'ALL';
  @Output() statusFilterChange = new EventEmitter<string>();
  @Output() sectionChange = new EventEmitter<string>();
  @Output() onAddStock = new EventEmitter<void>();
  @Output() onBadlo = new EventEmitter<string>();

  isStatusMenuOpen = false;
  isAddMenuOpen = false;

  constructor(private eRef: ElementRef) {} // Inject ElementRef

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activeSection'] || changes['sections']) {
      this.closeMenus();
    }
  }

  // --- CLICK OUTSIDE HANDLER ---
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // If click is NOT inside this component, close menus?
    // Actually, we need to check specifically if click is inside the dropdown containers.
    // But a simple approach for "Top Level" popups is:
    
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.closeMenus();
    }
  }

  // --- MENU ACTIONS ---
  toggleStatusMenu() { 
    // Close others
    this.isAddMenuOpen = false;
    this.isStatusMenuOpen = !this.isStatusMenuOpen; 
  }

  toggleAddMenu() { 
    this.isStatusMenuOpen = false;
    this.isAddMenuOpen = !this.isAddMenuOpen; 
  }

  closeMenus() {
    this.isStatusMenuOpen = false;
    this.isAddMenuOpen = false;
  }

  setStatus(status: string) {
    this.statusFilter = status;
    this.statusFilterChange.emit(status);
    this.closeMenus();
  }
  
  updateSearch(value: string) {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
  }
}
