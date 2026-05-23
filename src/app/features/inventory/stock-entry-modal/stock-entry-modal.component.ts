import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PartyService, Party, UnsettledTransaction } from '../../parties/party.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({ selector: 'app-stock-entry-modal', templateUrl: './stock-entry-modal.component.html' })
export class StockEntryModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  
  Math = Math; // RESTORED: Needed for HTML templates

  // --- STATE ---
  items: any[] = [];
  formData = {
    entryDate: new Date().toISOString().split('T')[0], partyId: null as number | null, partyName: '', description: '', status: 'STOCK',
    saleGrossWeight: 0, saleFineWeight: 0, badloGrossWeight: 0, totalBadloFineWeight: 0, totalGrossWeight: 0, totalFineWeight: 0,
    totalStockAmount: 0, totalProfit: 0, totalProfitMetal: 0, avgEffectiveRate: 0, totalBillAmount: 0, paidAmount: null as number | null,
  };
  badloData = { extraPerKg: 0, rounding: 0, targetChorsaWeight: 0, actualChorsaWeight: null as number | null, rate: null as number | null, weightDiff: 0, netAmount: 0 };
  
  // UI Flags
  isBadloEnabled = false;
  enableItemSettlement = false;
  isAddPartyModalOpen = false;
  isSavingNewParty = false; // RESTORED
  isDescriptionEditable = false; // RESTORED
  
  unsettledHistory: UnsettledTransaction[] = [];
  
  // Totals
  netPayableFinal = 0;
  pendingBalanceFinal = 0;
  totalSettlementSelected = 0;
  totalSelectedPending = 0;

  // Search
  isPartySearchOpen = false;
  allParties: Party[] = [];
  filteredParties: Party[] = [];
  selectedParty: Party | null = null;
  private searchSubject = new Subject<string>();

  // Toast/Confirm
  toast = { show: false, message: '', type: 'error' as any };
  confirmation = { show: false, message: '' };

  constructor(private partyService: PartyService) { this.searchSubject.pipe(debounceTime(100)).subscribe(t => this.performFilter(t)); }
  ngOnInit() { this.loadParties(); }
  ngOnChanges(changes: SimpleChanges) { if (changes['isOpen'] && this.isOpen) this.resetForm(); }
  get hasBadloItems() { return this.items.some(i => i.isBadloItem); }

  // --- ACTIONS ---
  loadParties() { this.partyService.getParties().subscribe(d => { this.allParties = d; this.performFilter(''); }); }
  onSearchInput(term: any) { this.formData.partyName = term; this.isPartySearchOpen = true; this.searchSubject.next(term); }
  performFilter(term: string) { this.filteredParties = !term ? this.allParties.slice(0, 50) : this.allParties.filter(p => p.name.toLowerCase().includes(term.toLowerCase()) || p.contact.includes(term)).slice(0, 50); }
  
  selectParty(p: Party) { 
    this.selectedParty = p; 
    this.formData.partyId = p.id; 
    this.formData.partyName = p.name; 
    this.isPartySearchOpen = false; 
    this.partyService.getUnsettledHistory(p.id).subscribe(h => {
        this.unsettledHistory = h.map(x => ({...x, isSelected: false, settleAmount: 0}));
    }); 
  }
  
  unselectParty() { 
    this.selectedParty = null; 
    this.formData.partyId = null; 
    this.formData.partyName = ''; 
    this.unsettledHistory = []; 
    this.enableItemSettlement = false; 
    this.calculateSettlement(); 
  }
  
  openAddPartyModal() { 
    this.isAddPartyModalOpen = true; 
    this.isPartySearchOpen = false;
  } 
  
  // RESTORED: Full Party Save Logic
  handleNewPartySave(newPartyData: any) {
    this.isSavingNewParty = true;
    this.partyService.addParty(newPartyData).subscribe({
      next: (createdParty) => {
        this.loadParties();
        this.selectParty(createdParty);
        this.isSavingNewParty = false;
        this.isAddPartyModalOpen = false;
        this.showToast('Party created successfully', 'success');
      },
      error: () => {
        this.isSavingNewParty = false;
        this.showToast('Failed to create party', 'error');
      },
    });
  }

  // --- SETTLEMENT WRAPPERS ---
  toggleSettlement() {
    if (!this.selectedParty) {
      this.showToast("Please select a party first.", 'error');
      this.enableItemSettlement = false;
      return;
    }
    if (!this.enableItemSettlement) {
      this.unsettledHistory.forEach((i) => { i.isSelected = false; i.settleAmount = 0; });
    }
    this.calculateSettlement();
  }

  toggleSelectAll(checked: boolean) {
    this.unsettledHistory.forEach((i) => { 
      i.isSelected = checked; 
      i.settleAmount = checked ? Math.abs(i.pendingAmount) : 0; 
    });
    this.calculateSettlement();
  }

  onItemSelect(item: UnsettledTransaction) {
    const currentAmount = item.settleAmount || 0;
    if (!item.isSelected && currentAmount > 0) item.isSelected = true;
    if (item.isSelected && currentAmount === 0) item.settleAmount = Math.abs(item.pendingAmount);
    if (!item.isSelected) item.settleAmount = 0;
    this.calculateSettlement();
  }

  // --- CALCULATIONS ---
  recalculateGlobals() {
    this.formData.saleGrossWeight = this.items.filter(i => !i.isBadloItem).reduce((s, i) => s + i.grossWeight, 0);
    this.formData.saleFineWeight = this.items.filter(i => !i.isBadloItem).reduce((s, i) => s + i.fineWeight, 0);
    this.formData.badloGrossWeight = this.items.filter(i => i.isBadloItem).reduce((s, i) => s + i.grossWeight, 0);
    this.formData.totalBadloFineWeight = this.items.filter(i => i.isBadloItem).reduce((s, i) => s + i.fineWeight, 0);
    this.formData.totalGrossWeight = this.formData.saleGrossWeight + this.formData.badloGrossWeight;
    this.formData.totalFineWeight = this.formData.saleFineWeight + this.formData.totalBadloFineWeight;
    
    this.formData.totalProfit = this.items.reduce((s, i) => s + i.profitAmount, 0);
    this.formData.totalProfitMetal = this.items.reduce((s, i) => s + i.profitWeight, 0);
    this.formData.totalStockAmount = this.items.filter(i => !i.isBadloItem).reduce((s, i) => s + i.amount, 0);
    
    if (this.formData.saleFineWeight > 0) this.formData.avgEffectiveRate = this.formData.totalStockAmount / (this.formData.saleFineWeight / 1000);
    else this.formData.avgEffectiveRate = 0;

    // RESTORED: Description Auto-Generation
    if (!this.isDescriptionEditable) {
      const gross = this.formData.totalGrossWeight;
      this.formData.description = gross > 0 ? `RUPA (${gross.toFixed(2)}g)` : '';
    }

    if (this.isBadloEnabled) this.calculateBadlo();
    else this.badloData.netAmount = 0;

    this.formData.totalBillAmount = this.formData.totalStockAmount + (this.isBadloEnabled ? this.badloData.netAmount : 0);
    this.netPayableFinal = this.formData.totalBillAmount + this.totalSettlementSelected;
    this.pendingBalanceFinal = this.netPayableFinal - (this.formData.paidAmount || 0);
  }

  calculateBadlo() {
    if (this.isBadloEnabled && !this.hasBadloItems) { this.showToast("Cannot enable Badlo without items", 'error'); this.isBadloEnabled = false; this.badloData.netAmount = 0; return; }
    if (!this.isBadloEnabled) { this.badloData.netAmount = 0; this.recalculateGlobals(); return; }

    const fine = this.formData.totalBadloFineWeight; 
    const extra = (fine * this.badloData.extraPerKg) / 1000;
    this.badloData.targetChorsaWeight = fine + extra + (this.badloData.rounding || 0);
    const actual = this.badloData.actualChorsaWeight || 0;
    this.badloData.weightDiff = actual - this.badloData.targetChorsaWeight;

    if (Math.abs(this.badloData.weightDiff) < 0.001) {
      this.badloData.weightDiff = 0; this.badloData.netAmount = 0;
      if (this.badloData.rate) this.badloData.rate = null; 
    } else {
      this.badloData.netAmount = -1 * (this.badloData.weightDiff / 1000) * (this.badloData.rate || 0);
    }
    
    this.formData.totalBillAmount = this.formData.totalStockAmount + this.badloData.netAmount;
    this.netPayableFinal = this.formData.totalBillAmount + this.totalSettlementSelected;
    this.pendingBalanceFinal = this.netPayableFinal - (this.formData.paidAmount || 0);
  }

  calculateSettlement() {
    this.totalSettlementSelected = 0; this.totalSelectedPending = 0;
    if (this.enableItemSettlement) {
      this.unsettledHistory.forEach(i => {
        if (i.isSelected) {
          this.totalSelectedPending += i.pendingAmount;
          const amt = i.settleAmount || 0;
          if (amt) {
             const sign = i.pendingAmount < 0 ? -1 : 1;
             this.totalSettlementSelected += sign * Math.abs(amt);
          }
        }
      });
    }
    this.recalculateGlobals();
  }

  onSubmit() {
     if (!this.formData.partyId) { this.showToast('Select party', 'error'); return; }
     if (this.items.length === 0) { this.showToast('Add items', 'error'); return; }
     if (this.formData.paidAmount === null || this.formData.paidAmount === undefined || this.formData.paidAmount.toString() === '') {
        this.confirmation.message = "Paid amount empty. Save as 0?"; this.confirmation.show = true; return;
     }
     this.finalizeSave();
  }
  
  finalizeSave() {
     this.save.emit({
        ...this.formData, items: this.items, isBadlo: this.isBadloEnabled, badlo: this.isBadloEnabled ? this.badloData : null,
        settlements: this.unsettledHistory.filter(i => i.isSelected).map(i => ({id: i.id, amount: i.settleAmount})),
        closing: { net: this.netPayableFinal, bal: this.pendingBalanceFinal }
     });
  }

  resetForm() {
    this.items = []; this.isBadloEnabled = false; this.enableItemSettlement = false; this.unsettledHistory = []; this.selectedParty = null;
    this.isAddPartyModalOpen = false; this.isDescriptionEditable = false;
    this.formData = { ...this.formData, partyId: null, partyName: '', paidAmount: null, totalGrossWeight: 0, totalFineWeight: 0, description: '' }; 
    this.badloData = { extraPerKg: 0, rounding: 0, targetChorsaWeight: 0, actualChorsaWeight: null, rate: null, weightDiff: 0, netAmount: 0 };
    this.recalculateGlobals();
  }

  showToast(msg: string, type: any) { this.toast = {show: true, message: msg, type}; setTimeout(() => this.toast.show = false, 3000); }
  closeConfirmation(c: boolean) { this.confirmation.show = false; if(c) { this.formData.paidAmount = 0; this.finalizeSave(); } }
}
