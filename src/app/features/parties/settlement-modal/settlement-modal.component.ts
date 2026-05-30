import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Party, PartyService, LedgerTransaction } from '../../parties/party.service';
import { LedgerPrintService } from './ledger-print.service';

interface ReceiptLine {
  message: string;
  valueStr: string;
  isCleared: boolean;
}

@Component({
  selector: 'app-settlement-modal',
  templateUrl: './settlement-modal.component.html'
})
export class SettlementModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() parties: Party[] = [];
  @Input() preSelectedPartyId: number | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() settled = new EventEmitter<void>();

  selectedParty: Party | null = null;
  customerSearchTerm: string = '';
  isDropdownOpen: boolean = false;
  
  txMode: 'RECEIVE' | 'GIVE' = 'RECEIVE';
  
  settlementStrategy: 'CASCADE' | 'SPECIFIC' | 'AS_IS' = 'CASCADE';
  specificTarget: 'CASH' | 'GOLD' | 'SILVER' = 'CASH';
  cascadePriority: ('CASH' | 'GOLD' | 'SILVER')[] = ['CASH', 'GOLD', 'SILVER'];

  activeAssets = { cash: true, gold: true, silver: true };
  
  // 🌟 REFACTORED: Structural clean data nodes object array for UI receipt lines mapping
  calculationAuditTrail: ReceiptLine[] = [];

  // 🌟 HEADER INTEGRATION VALUE SYSTEM VARIABLES
  globalRates = {
    gold: 72000,   // Per 10 Grams base unit benchmark
    silver: 88000  // Per 1 Kilogram base unit benchmark
  };

  sandbox = { inputValue: '', mode: 'CASH_TO_METALS', outputResult: '0.00 Metric' };

  transactionHistory: LedgerTransaction[] = [];
  filterFromDate: string = '';
  filterToDate: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  descriptionNote: string = 'Counter Settlement Dispatch';

  assetsBrought = {
    cash: null as any,
    goldGrams: null as any,
    silverGrams: null as any
  };

  constructor(
    private partyService: PartyService,
    private printService: LedgerPrintService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.preSelectedPartyId) this.selectPartyById(this.preSelectedPartyId);
      else this.resetInternalState();
    }
  }

  get filteredParties(): Party[] {
    if (!this.customerSearchTerm) return this.parties;
    return this.parties.filter(p => p.name.toLowerCase().includes(this.customerSearchTerm.toLowerCase()));
  }

  selectParty(party: Party): void {
    this.selectedParty = party;
    this.customerSearchTerm = party.name;
    this.isDropdownOpen = false;
    this.currentPage = 0;
    this.loadHistory();
  }

  selectPartyById(id: number): void {
    const found = this.parties.find(p => p.id === id);
    if (found) this.selectParty(found);
  }

  loadHistory(): void {
    if (!this.selectedParty) return;
    this.partyService.getPartyTransactionsPaged(
      this.selectedParty.id, this.filterFromDate, this.filterToDate, this.currentPage, this.pageSize
    ).subscribe({
      next: (pageData: any) => {
        this.transactionHistory = pageData.content || [];
        this.totalPages = pageData.totalPages || 0;
        this.totalElements = pageData.totalElements || 0;
      },
      error: (err: any) => console.error("Error logging paginated data lines:", err)
    });
  }

  onFilterChange(): void { this.currentPage = 0; this.loadHistory(); }
  goToPage(page: number): void { if (page >= 0 && page < this.totalPages) { this.currentPage = page; this.loadHistory(); } }

  validateActiveAssetCount(): void {
    const activeCount = Object.values(this.activeAssets).filter(Boolean).length;
    if (activeCount === 0) {
      alert("At least one tracking line must remain checked.");
      this.activeAssets.cash = true;
    }
  }

  setStrategyMode(mode: 'CASCADE' | 'AS_IS' | 'SPECIFIC_CASH' | 'SPECIFIC_GOLD' | 'SPECIFIC_SILVER'): void {
    if (mode === 'CASCADE') {
      this.settlementStrategy = 'CASCADE';
    } else if (mode === 'AS_IS') {
      this.settlementStrategy = 'AS_IS';
    } else {
      this.settlementStrategy = 'SPECIFIC';
      if (mode === 'SPECIFIC_CASH') this.specificTarget = 'CASH';
      if (mode === 'SPECIFIC_GOLD') this.specificTarget = 'GOLD';
      if (mode === 'SPECIFIC_SILVER') this.specificTarget = 'SILVER';
    }
  }

  get displayPriorityQueue(): ('CASH' | 'GOLD' | 'SILVER')[] {
    return this.cascadePriority.filter(item => {
      if (item === 'CASH') return this.activeAssets.cash;
      if (item === 'GOLD') return this.activeAssets.gold;
      if (item === 'SILVER') return this.activeAssets.silver;
      return false;
    });
  }

  printStatementPDF(): void {
    if (!this.selectedParty) return;
    
    // Executes using your exact printService signature
    this.printService.printLandscapeLedger(
      this.selectedParty, 
      this.transactionHistory
    );
  }

  shiftPriorityOrder(currentIndex: number, direction: number): void {
    const visibleQueue = this.displayPriorityQueue;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= visibleQueue.length) return;

    const itemA = visibleQueue[currentIndex];
    const itemB = visibleQueue[targetIndex];

    const idxA = this.cascadePriority.indexOf(itemA);
    const idxB = this.cascadePriority.indexOf(itemB);

    this.cascadePriority[idxA] = itemB;
    this.cascadePriority[idxB] = itemA;
  }

  // Gram valuation metrics reading directly from the active live fields inside the header model
  get currentGoldCashValue(): number { 
    if (!this.activeAssets.gold) return 0;
    const ratePerGram = (Number(this.globalRates.gold) || 0) / 10;
    return (Number(this.assetsBrought.goldGrams) || 0) * ratePerGram; 
  }
  get currentSilverCashValue(): number { 
    if (!this.activeAssets.silver) return 0;
    const ratePerGram = (Number(this.globalRates.silver) || 0) / 1000;
    return (Number(this.assetsBrought.silverGrams) || 0) * ratePerGram; 
  }
  get totalBroughtValue(): number { 
    const cashIn = this.activeAssets.cash ? (Number(this.assetsBrought.cash) || 0) : 0;
    if (this.txMode === 'GIVE') {
      const goldIn = this.activeAssets.gold ? (Number(this.assetsBrought.goldGrams) || 0) : 0;
      const silverIn = this.activeAssets.silver ? (Number(this.assetsBrought.silverGrams) || 0) : 0;
      return cashIn + goldIn + silverIn;
    }
    return cashIn + this.currentGoldCashValue + this.currentSilverCashValue; 
  }

  // COMPACT LOGICAL FORECAST BALANCES ENGINE PIPELINE MATRIX
  get forecastedBalances() {
    const state = {
      cash: this.selectedParty?.cashBalance || 0,
      gold: this.selectedParty?.goldBalance || 0,
      silver: this.selectedParty?.silverBalance || 0
    };

    this.calculationAuditTrail = [];
    if (!this.selectedParty) return state;

    const inputCash = this.activeAssets.cash ? (Number(this.assetsBrought.cash) || 0) : 0;
    const inputGoldGrams = this.activeAssets.gold ? (Number(this.assetsBrought.goldGrams) || 0) : 0;
    const inputSilverGrams = this.activeAssets.silver ? (Number(this.assetsBrought.silverGrams) || 0) : 0;

    const goldGramRate = (Number(this.globalRates.gold) || 0) / 10;
    const silverGramRate = (Number(this.globalRates.silver) || 0) / 1000;

    if (this.txMode === 'GIVE') {
      state.cash -= inputCash; state.gold -= inputGoldGrams; state.silver -= inputSilverGrams;
      return state;
    }

    if (this.settlementStrategy === 'AS_IS') {
      state.cash += inputCash; state.gold += inputGoldGrams; state.silver += inputSilverGrams;
      return state;
    }

    if (this.settlementStrategy === 'SPECIFIC') {
      const poolValue = inputCash + (inputGoldGrams * goldGramRate) + (inputSilverGrams * silverGramRate);
      if (this.specificTarget === 'CASH') state.cash += poolValue;
      else if (this.specificTarget === 'GOLD') state.gold += (poolValue / goldGramRate);
      else if (this.specificTarget === 'SILVER') state.silver += (poolValue / silverGramRate);
      return state;
    }

    // PROCESS THE SEQUENTIAL SMART LIQUIDATION PROFILE MATRIX
    let availableValueWallet = inputCash + (inputGoldGrams * goldGramRate) + (inputSilverGrams * silverGramRate);
    const activeOrderQueue = this.displayPriorityQueue;

    for (const targetNode of activeOrderQueue) {
      if (availableValueWallet <= 0) break;

      if (targetNode === 'CASH' && state.cash < 0) {
        const liability = Math.abs(state.cash);
        const chunk = Math.min(availableValueWallet, liability);
        state.cash += chunk;
        availableValueWallet -= chunk;
        
        this.calculationAuditTrail.push({
          message: `Cleared Cash Account Liability`,
          valueStr: `-₹${chunk.toFixed(0)}`,
          isCleared: true
        });
      }
      else if (targetNode === 'GOLD' && state.gold < 0) {
        const liabilityInCash = Math.abs(state.gold) * goldGramRate;
        const chunkCash = Math.min(availableValueWallet, liabilityInCash);
        const resolvedGrams = chunkCash / goldGramRate;
        state.gold += resolvedGrams;
        availableValueWallet -= chunkCash;

        this.calculationAuditTrail.push({
          message: `Cleared Gold Account Liability`,
          valueStr: `-${resolvedGrams.toFixed(3)} g`,
          isCleared: true
        });
      }
      else if (targetNode === 'SILVER' && state.silver < 0) {
        const liabilityInCash = Math.abs(state.silver) * silverGramRate;
        const chunkCash = Math.min(availableValueWallet, liabilityInCash);
        const resolvedGrams = chunkCash / silverGramRate;
        state.silver += resolvedGrams;
        availableValueWallet -= chunkCash;

        this.calculationAuditTrail.push({
          message: `Cleared Silver Account Liability`,
          valueStr: `-${resolvedGrams.toFixed(0)} g`,
          isCleared: true
        });
      }
    }

    // DEPOSIT SURPLUS OVERPAYMENTS DIRECTLY BACK TO SOURCE TRACKS
    if (availableValueWallet > 0) {
      const originalTotalValueBrought = inputCash + (inputGoldGrams * goldGramRate) + (inputSilverGrams * silverGramRate);
      if (originalTotalValueBrought > 0) {
        const surplusRatio = availableValueWallet / originalTotalValueBrought;

        if (inputCash > 0) {
          const cashSurplusValue = inputCash * surplusRatio;
          state.cash += cashSurplusValue;
          this.calculationAuditTrail.push({
            message: `Deposited Surplus Overpayment to Cash`,
            valueStr: `+₹${cashSurplusValue.toFixed(0)}`,
            isCleared: false
          });
        }
        if (inputGoldGrams > 0) {
          const goldSurplusGrams = inputGoldGrams * surplusRatio;
          state.gold += goldSurplusGrams;
          this.calculationAuditTrail.push({
            message: `Deposited Surplus Overpayment to Gold`,
            valueStr: `+${goldSurplusGrams.toFixed(3)} g`,
            isCleared: false
          });
        }
        if (inputSilverGrams > 0) {
          const silverSurplusGrams = inputSilverGrams * surplusRatio;
          state.silver += silverSurplusGrams;
          this.calculationAuditTrail.push({
            message: `Deposited Surplus Overpayment to Silver`,
            valueStr: `+${silverSurplusGrams.toFixed(0)} g`,
            isCleared: false
          });
        }
      }
    }

    return state;
  }

  // 🌟 REFACTORED TRANSLATOR: RE-ROUTED DIRECTLY INTO GLOBAL LIVE RATES FROM HEADER
  runSandboxConversion(): void {
    const value = parseFloat(this.sandbox.inputValue);
    if (isNaN(value) || value <= 0) {
      this.sandbox.outputResult = '0.00';
      return;
    }
    const goldGramRate = (Number(this.globalRates.gold) || 72000) / 10;
    const silverGramRate = (Number(this.globalRates.silver) || 88000) / 1000;

    if (this.sandbox.mode === 'CASH_TO_METALS') {
      const targetGold = value / goldGramRate;
      const targetSilver = value / silverGramRate;
      this.sandbox.outputResult = `${targetGold.toFixed(3)}g Gold / ${Math.round(targetSilver)}g Silver`;
    } 
    else if (this.sandbox.mode === 'GOLD_TO_CASH') {
      const computedInrValue = value * goldGramRate;
      this.sandbox.outputResult = this.fmtINR(computedInrValue);
    } 
    else if (this.sandbox.mode === 'SILVER_TO_CASH') {
      const computedInrValue = value * silverGramRate;
      this.sandbox.outputResult = this.fmtINR(computedInrValue);
    }
  }

  submitTransaction(): void {
    if (!this.selectedParty || this.totalBroughtValue <= 0) return;
    const finals = this.forecastedBalances;
    const current = this.selectedParty;

    let payload: any = {
      actionType: this.txMode,
      description: `${this.descriptionNote} [Strategy: ${this.settlementStrategy}]`
    };

    if (this.txMode === 'GIVE') {
      payload.cash = this.activeAssets.cash ? (Number(this.assetsBrought.cash) || 0) : 0;
      payload.goldGrams = this.activeAssets.gold ? (Number(this.assetsBrought.goldGrams) || 0) : 0;
      payload.silverGrams = this.activeAssets.silver ? (Number(this.assetsBrought.silverGrams) || 0) : 0;
    } else {
      payload.cashCredit = finals.cash > current.cashBalance ? (finals.cash - current.cashBalance) : 0;
      payload.goldCredit = finals.gold > current.goldBalance ? (finals.gold - current.goldBalance) : 0;
      payload.silverCredit = finals.silver > current.silverBalance ? (finals.silver - current.silverBalance) : 0;
    }

    this.partyService.processSettlement(current.id, payload).subscribe({
      next: () => { this.settled.emit(); this.resetForm(); },
      error: (err: any) => console.error("Settlement operational error:", err)
    });
  }

  resetInternalState(): void {
    this.selectedParty = null; this.customerSearchTerm = ''; this.transactionHistory = [];
    this.calculationAuditTrail = []; this.filterFromDate = ''; this.filterToDate = ''; this.currentPage = 0;
    this.txMode = 'RECEIVE'; this.settlementStrategy = 'CASCADE';
    this.activeAssets = { cash: true, gold: true, silver: true };
    this.sandbox = { inputValue: '', mode: 'CASH_TO_METALS', outputResult: '0.00 Metric' };
    this.cascadePriority = ['CASH', 'GOLD', 'SILVER'];
    this.globalRates = { gold: 72000, silver: 88000 };
    this.assetsBrought = { cash: null as any, goldGrams: null as any, silverGrams: null as any };
  }

  resetForm(): void { this.resetInternalState(); this.close.emit(); }
  fmtINR(val: any): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(val) || 0); }
  fmtGold(val: number): string { return val ? `${val.toFixed(3)} g` : '0 g'; }
  fmtSilver(val: number): string { return val ? `${new Intl.NumberFormat('en-IN').format(Math.round(val))} g` : '0 g'; }
}