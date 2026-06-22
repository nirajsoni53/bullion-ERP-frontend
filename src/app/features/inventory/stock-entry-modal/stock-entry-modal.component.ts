import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PartyService, Party, UnsettledTransaction } from '../../parties/party.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({ 
  selector: 'app-stock-entry-modal', 
  templateUrl: './stock-entry-modal.component.html' 
})
export class StockEntryModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  
  Math = Math;

  // --- STATE ---
  items: any[] = [];
  formData = {
    entryDate: new Date().toISOString().split('T')[0], partyId: null as number | null, partyName: '', description: '', status: 'STOCK',
    saleGrossWeight: 0, saleFineWeight: 0, badloGrossWeight: 0, totalBadloFineWeight: 0, totalGrossWeight: 0, totalFineWeight: 0,
    totalStockAmount: 0, totalProfit: 0, totalProfitMetal: 0, avgEffectiveRate: 0, totalBillAmount: 0, 
    
    paidAmount: null as number | null,
    paidGoldGrams: null as number | null,
    paidSilverGrams: null as number | null,

    totalGoldBillWeight: 0,
    totalSilverBillWeight: 0,
    goldWeightSettledSelected: 0,
    silverWeightSettledSelected: 0,
    goldWeightPending: 0,
    silverWeightPending: 0,
    goldClosingBalance: 0,
    silverClosingBalance: 0
  };

  // Explicitly type the Toast state structure
  toast: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'warning'; // restricts to valid semantic types
  } = { 
    show: false, 
    message: '', 
    type: 'error' 
  };

  // Explicitly type the Confirmation Modal structure
  confirmation: {
    show: boolean;
    message: string;
  } = { 
    show: false, 
    message: '' 
  };

  // Upgraded: Structure initialization to handle dynamic nested Chorsa configurations
  badloData: any = { 
    totalWeightDiff: 0, 
    totalNetAmount: 0, 
    chorsaVariants: {} 
  };
  
  isBadloEnabled = false;
  enableItemSettlement = false;
  isAddPartyModalOpen = false;
  isSavingNewParty = false; 
  isDescriptionEditable = false; 
  
  unsettledHistory: UnsettledTransaction[] = [];
  
  netPayableFinal = 0;
  pendingBalanceFinal = 0;
  totalSettlementSelected = 0;
  totalSelectedPending = 0;

  isPartySearchOpen = false;
  allParties: Party[] = [];
  filteredParties: Party[] = [];
  selectedParty: Party | null = null;
  private searchSubject = new Subject<string>();

  constructor(private partyService: PartyService) { 
    this.searchSubject.pipe(debounceTime(100)).subscribe(t => this.performFilter(t)); 
  }
  
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
    this.partyService.getUnsettledHistory(p.id).subscribe((h: UnsettledTransaction[]) => {
      this.unsettledHistory = h.map((x: UnsettledTransaction) => ({
        ...x, 
        isSelected: false, 
        settleAmount: 0
      }));
      this.calculateSettlement();
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
    
    this.formData.totalGoldBillWeight = this.items.filter(i => i.metalType === 'GOLD').reduce((s, i) => s + (i.fineWeight || 0), 0);
    this.formData.totalSilverBillWeight = this.items.filter(i => i.metalType === 'SILVER').reduce((s, i) => s + (i.fineWeight || 0), 0);

    if (this.formData.saleFineWeight > 0) this.formData.avgEffectiveRate = this.formData.totalStockAmount / (this.formData.saleFineWeight / 1000);
    else this.formData.avgEffectiveRate = 0;

    if (!this.isDescriptionEditable) {
      const gross = this.formData.totalGrossWeight;
      this.formData.description = gross > 0 ? `RUPA (${gross.toFixed(2)}g)` : '';
    }

    // Upgraded: Connect to dynamic multi-variant calculator engine
    if (this.isBadloEnabled) {
      this.calculateBadlo();
    } else {
      this.badloData.totalWeightDiff = 0;
      this.badloData.totalNetAmount = 0;
      this.badloData.chorsaVariants = {};
    }

    // Connect aggregated totals across all active variations to cash calculations
    this.formData.totalBillAmount = this.formData.totalStockAmount + (this.isBadloEnabled ? this.badloData.totalNetAmount : 0);
    this.netPayableFinal = this.formData.totalBillAmount + this.totalSettlementSelected;
    this.pendingBalanceFinal = this.netPayableFinal - (this.formData.paidAmount || 0);

    const baseGoldPending = this.formData.totalGoldBillWeight - this.formData.goldWeightSettledSelected;
    this.formData.goldWeightPending = baseGoldPending; 
    const openingGold = this.selectedParty ? (this.selectedParty.goldBalance || 0) : 0;
    this.formData.goldClosingBalance = openingGold + baseGoldPending - (this.formData.paidGoldGrams || 0);

    const baseSilverPending = this.formData.totalSilverBillWeight - this.formData.silverWeightSettledSelected;
    this.formData.silverWeightPending = baseSilverPending;
    const openingSilver = this.selectedParty ? (this.selectedParty.silverBalance || 0) : 0;
    this.formData.silverClosingBalance = openingSilver + baseSilverPending - (this.formData.paidSilverGrams || 0);
  }

  // Upgraded: Complete refactoring to calculate dynamically per variant without mutations
  calculateBadlo() {
    const badloItems = this.items.filter(i => i.isBadloItem);
    
    if (this.isBadloEnabled && badloItems.length === 0) { 
      this.showToast("Cannot enable Badlo without items", 'error'); 
      this.isBadloEnabled = false; 
      this.badloData = { totalWeightDiff: 0, totalNetAmount: 0, chorsaVariants: {} }; 
      return; 
    }
    
    if (!this.isBadloEnabled) { 
      this.badloData = { totalWeightDiff: 0, totalNetAmount: 0, chorsaVariants: {} }; 
      return; 
    }

    // Preserve previously typed inputs to prevent UI focus resets
    const existingVariants = { ...this.badloData.chorsaVariants };
    
    let masterTotalWeightDiff = 0;
    let masterTotalNetAmount = 0;
    const workingVariants: any = {};

    // Group active entries by chorsa code
    badloItems.forEach(item => {
      const chorsaKey = item.chorsa || '99';
      if (!workingVariants[chorsaKey]) {
        const oldGroup = existingVariants[chorsaKey] || {};
        workingVariants[chorsaKey] = {
          extraPerKg: oldGroup.extraPerKg !== undefined ? oldGroup.extraPerKg : 0,
          rounding: oldGroup.rounding !== undefined ? oldGroup.rounding : 0,
          actualChorsaWeight: oldGroup.actualChorsaWeight !== undefined ? oldGroup.actualChorsaWeight : 0,
          rate: oldGroup.rate !== undefined ? oldGroup.rate : 0,
          sumFineWeight: 0,
          targetChorsaWeight: 0,
          weightDiff: 0,
          netAmount: 0
        };
      }
      workingVariants[chorsaKey].sumFineWeight += item.fineWeight || 0;
    });

    // Execute formula maps dynamically for each variation group
    Object.keys(workingVariants).forEach(key => {
      const group = workingVariants[key];
      const extraGrams = (group.sumFineWeight / 1000) * group.extraPerKg;
      
      group.targetChorsaWeight = group.sumFineWeight + extraGrams + group.rounding;
      group.weightDiff = group.actualChorsaWeight - group.targetChorsaWeight;

      if (Math.abs(group.weightDiff) < 0.001) {
        group.weightDiff = 0;
        group.netAmount = 0;
        group.rate = 0;
      } else {
        // Multiplied by -1 to mirror operational accounting (paying vs receiving balance)
        group.netAmount = -1 * (group.weightDiff / 1000) * (group.rate || 0);
      }

      masterTotalWeightDiff += group.weightDiff;
      masterTotalNetAmount += group.netAmount;
    });

    this.badloData = {
      totalWeightDiff: masterTotalWeightDiff,
      totalNetAmount: masterTotalNetAmount,
      chorsaVariants: workingVariants
    };
  }

  calculateSettlement() {
    this.totalSettlementSelected = 0; 
    this.totalSelectedPending = 0;
    this.formData.goldWeightSettledSelected = 0;
    this.formData.silverWeightSettledSelected = 0;

    if (this.enableItemSettlement) {
      this.unsettledHistory.forEach(i => {
        if (i.isSelected) {
          const amt = i.settleAmount || 0;
          if (i.type === 'GOLD') {
            this.formData.goldWeightSettledSelected += amt;
          } else if (i.type === 'SILVER') {
            this.formData.silverWeightSettledSelected += amt;
          } else {
            this.totalSelectedPending += i.pendingAmount;
            if (amt) {
               const sign = i.pendingAmount < 0 ? -1 : 1;
               this.totalSettlementSelected += sign * Math.abs(amt);
            }
          }
        }
      });
    }
    this.recalculateGlobals();
  }

  onSubmit() {
     if (!this.formData.partyId) { this.showToast('Select party', 'error'); return; }
     if (this.items.length === 0) { this.showToast('Add items', 'error'); return; }
     
     const hasPayments = this.formData.paidAmount || this.formData.paidGoldGrams || this.formData.paidSilverGrams;
     if (!hasPayments) {
        this.confirmation.message = "All counter payment entries are empty. Save as 0?"; 
        this.confirmation.show = true; 
        return;
     }
     this.finalizeSave();
  }
  
  finalizeSave() {
     this.save.emit({
        ...this.formData, items: this.items, isBadlo: this.isBadloEnabled, badlo: this.isBadloEnabled ? this.badloData : null,
        settlements: this.unsettledHistory.filter(i => i.isSelected).map(i => ({id: i.id, amount: i.settleAmount, type: i.type})),
        closing: { 
          net: this.netPayableFinal, 
          bal: this.pendingBalanceFinal,
          goldClosing: this.formData.goldClosingBalance,
          silverClosing: this.formData.silverClosingBalance
        }
     });
  }

  resetForm() {
    this.items = []; this.isBadloEnabled = false; this.enableItemSettlement = false; this.unsettledHistory = []; this.selectedParty = null;
    this.isAddPartyModalOpen = false; this.isDescriptionEditable = false;
    this.formData = { 
      ...this.formData, 
      partyId: null, partyName: '', paidAmount: null, paidGoldGrams: null, paidSilverGrams: null,
      totalGrossWeight: 0, totalFineWeight: 0, description: '',
      totalGoldBillWeight: 0, totalSilverBillWeight: 0, goldWeightSettledSelected: 0, silverWeightSettledSelected: 0,
      goldWeightPending: 0, silverWeightPending: 0, goldClosingBalance: 0, silverClosingBalance: 0
    }; 
    this.badloData = { totalWeightDiff: 0, totalNetAmount: 0, chorsaVariants: {} };
    this.recalculateGlobals();
  }

  showToast(msg: string, type: any) { this.toast = {show: true, message: msg, type}; setTimeout(() => this.toast.show = false, 3000); }
  closeConfirmation(c: boolean) { this.confirmation.show = false; if(c) { this.formData.paidAmount = 0; this.finalizeSave(); } }
}