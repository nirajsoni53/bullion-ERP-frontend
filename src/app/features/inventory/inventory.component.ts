import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { InventoryService, InventoryItem } from './inventory.service';
import { METALS, MetalConfig } from './metal.config';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent implements OnInit {
  
  // --- CONFIGURATION ---
  page = 'INVENTORY';
  metals = METALS; // Expose config to HTML
  protected readonly Math = Math; 

  // --- STATE ---
  activeMetal: MetalConfig = this.metals[0]; // Default: Silver
  activeSection: string = this.activeMetal.sections[0]; // Default: Rupa
  
  items: InventoryItem[] = []; // Raw data from API
  
  // --- FILTERS ---
  searchTerm = '';
  statusFilter = 'ALL';

  // --- PAGINATION ---
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 50, 100];
  
  // --- SELECTION ---
  selectedIds: Set<number> = new Set();
  
  // --- ROW MENU ---
  activeRowMenuId: number | null = null; 

  modals = {
    addStock: false,
  };

   constructor(
    private inventoryService: InventoryService,
    private eRef: ElementRef // Inject ElementRef
  ) {}

  ngOnInit() {
    this.loadData();
  }

  // --- 1. DATA LOGIC ---
  loadData() {
    this.inventoryService.getItems().subscribe(data => {
      this.items = data;
    });
  }

  // --- 2. SWITCHING LOGIC ---
  
  // Switch Metal (e.g. Silver -> Gold)
  setActiveMetal(metal: MetalConfig) {
    if (this.activeMetal.key === metal.key) return; // No change

    this.activeMetal = metal;
    this.activeSection = metal.sections[0]; // Reset to first tab (e.g. Rani)
    
    // Reset View State
    this.currentPage = 1;
    this.clearSelection();
    this.activeRowMenuId = null;
  }

  // Switch Section (e.g. Rupa -> Chorsa)
  setActiveSection(section: string) {
    this.activeSection = section;
    this.currentPage = 1;
    this.clearSelection();
    this.activeRowMenuId = null;
  }

  // --- 3. CORE FILTERING ---
  get filteredItems(): InventoryItem[] {
    if (!this.items || this.items.length === 0) return [];

    return this.items.filter(item => {
      
      // A. METAL FILTER
      // (Safety: Ensure we only show items for the active metal)
      if (item.metal !== this.activeMetal.key) return false;

      // B. SECTION FILTER
      // (Ensure we only show items for the active section)
      if (item.section !== this.activeSection) return false;

      // C. STATUS FILTER
      if (this.statusFilter !== 'ALL' && item.status !== this.statusFilter) {
        return false;
      }
      
      // D. SEARCH FILTER
      const term = this.searchTerm.toLowerCase().trim();
      if (!term) return true;

      const str = (v: any) => (v ? v.toString().toLowerCase() : '');
      const partyName = item.party ? str(item.party.name) : '';

      return partyName.includes(term) || 
             str(item.id).includes(term) ||
             str(item.buyRate).includes(term) ||
             str(item.grossWeightG).includes(term) ||
             str(item.fineG).includes(term) ||
             str(item.buyDate).includes(term) ||
             str(item.status).includes(term);
    });
  }

  // --- 4. PAGINATION LOGIC ---
  get paginatedItems(): InventoryItem[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredItems.slice(startIndex, startIndex + this.pageSize);
  }

  setPage(page: number) {
    this.currentPage = page;
    this.clearSelection();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.clearSelection();
  }

  // --- 5. SELECTION LOGIC ---
  isSelectable(item: InventoryItem): boolean {
    return item.status === 'STOCK';
  }

  toggleSelection(id: number) {
    const item = this.items.find(i => i.id === id);
    if (item && !this.isSelectable(item)) return;

    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  toggleAllSelection(event: any) {
    const isChecked = event.target.checked;
    const selectableItems = this.paginatedItems.filter(i => this.isSelectable(i));

    if (isChecked) {
        selectableItems.forEach(i => this.selectedIds.add(i.id));
      } else {
        selectableItems.forEach(i => this.selectedIds.delete(i.id));
    }
  }

  get isAllSelected(): boolean {
    const selectableItems = this.paginatedItems.filter(i => this.isSelectable(i));
    return selectableItems.length > 0 && selectableItems.every(i => this.selectedIds.has(i.id));
  }

  get isIndeterminate(): boolean {
    const selectableItems = this.paginatedItems.filter(i => this.isSelectable(i));
    const selectedCount = selectableItems.filter(i => this.selectedIds.has(i.id)).length;
    return selectedCount > 0 && selectedCount < selectableItems.length;
  }

  clearSelection() {
    this.selectedIds.clear();
  }

  sellSelected() {
    console.log('Bulk Sell Items:', Array.from(this.selectedIds));
    this.clearSelection();
  }

  // --- 6. UI ACTIONS ---
  toggleRowMenu(event: Event, id: number) {
    event.stopPropagation();
    this.activeRowMenuId = this.activeRowMenuId === id ? null : id;
  }


   // --- CLICK OUTSIDE FOR ROW MENU ---
  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    // If click is outside, close the row menu
    if (this.activeRowMenuId !== null) {
      // Check if click target is NOT inside the table action column
      // A simple way is to just close it on ANY document click, 
      // because the button click itself uses $event.stopPropagation()
      this.activeRowMenuId = null;
    }
  }
  
  // Logic to convert Order -> Stock
  moveToStock(id: number) {
    console.log(`Moving Order #${id} to Stock`);
    // In real app: Call API, then reload data
    // Mock update:
    const item = this.items.find(i => i.id === id);
    if (item) item.status = 'STOCK';
    this.activeRowMenuId = null;
  }

  openPartyModalFromInventory() {
    this.modals.addStock = false; // Close stock modal
    // Logic to open Party Modal (might need to communicate with parent or shared service)
    // Or simply navigate to Parties page
  }

  handleStockSave(data: any) {
    console.log('Saving Stock:', data);
    // Call Service to Save
    this.modals.addStock = false;
  }

  openAdd() { this.modals.addStock = true; }
  openBadlo(type: any) { console.log('Badlo', type); }
  openEdit(id: number) { console.log('Edit', id); }
  openSell(id: number) { console.log('Sell', id); }
  openMelt(id: number) { console.log('Melt', id); }
  deleteItem(id: number) { console.log('Delete', id); }
  openHistory(item: any) { 
     if (this.activeRowMenuId) { this.activeRowMenuId = null; return; }
     console.log('History', item.id); 
  }

  // --- 7. FORMATTERS ---
  getPartyName(item: InventoryItem): string { return item.party?.name || 'Unknown'; }
  getPending(item: InventoryItem): number { return item.pendingAmount || 0; }
  fmtNum(v: any) { return v ?? '-'; }
  fmtINR(v: any) { return v ?? '-'; }
}
