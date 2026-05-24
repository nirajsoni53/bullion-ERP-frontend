import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Party, PartyService, LedgerTransaction, TransactionRequest } from '../../parties/party.service';

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
  settlementStrategy: 'SPECIFIC' | 'CASCADE' = 'SPECIFIC';
  specificTarget: 'CASH' | 'GOLD' | 'SILVER' = 'CASH';
  cascadePriority: ('CASH' | 'GOLD' | 'SILVER')[] = ['CASH', 'GOLD', 'SILVER'];

  transactionHistory: LedgerTransaction[] = [];
  descriptionNote: string = 'Counter Asset Settlement';

  assetsBrought = {
    cash: 0,
    goldGrams: 0,
    goldRate: 7200,
    silverGrams: 0,
    silverRate: 88
  };

  constructor(private partyService: PartyService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.preSelectedPartyId) {
        this.selectPartyById(this.preSelectedPartyId);
      } else {
        this.resetInternalState();
      }
    }
  }

  get filteredParties(): Party[] {
    if (!this.customerSearchTerm) return this.parties;
    return this.parties.filter(p => 
      p.name.toLowerCase().includes(this.customerSearchTerm.toLowerCase()) ||
      (p.shopName && p.shopName.toLowerCase().includes(this.customerSearchTerm.toLowerCase()))
    );
  }

  selectParty(party: Party): void {
    this.selectedParty = party;
    this.customerSearchTerm = party.name;
    this.isDropdownOpen = false;
    this.loadHistory(party.id);
  }

  selectPartyById(id: number): void {
    const found = this.parties.find(p => p.id === id);
    if (found) this.selectParty(found);
  }

  loadHistory(partyId: number): void {
    this.partyService.getPartyTransactions(partyId).subscribe({
      next: (data) => this.transactionHistory = data || [],
      error: (err) => console.error("Error reading ledger lines:", err)
    });
  }

  get currentGoldCashValue(): number { return (this.assetsBrought.goldGrams || 0) * (this.assetsBrought.goldRate || 0); }
  get currentSilverCashValue(): number { return (this.assetsBrought.silverGrams || 0) * (this.assetsBrought.silverRate || 0); }
  get totalBroughtValue(): number { return (this.assetsBrought.cash || 0) + this.currentGoldCashValue + this.currentSilverCashValue; }

  // FIXED ACCOUNTING FORECAST MATRIX
  get forecastedBalances() {
    const state = {
      cash: this.selectedParty?.cashBalance || 0,
      gold: this.selectedParty?.goldBalance || 0,
      silver: this.selectedParty?.silverBalance || 0
    };

    if (!this.selectedParty || this.totalBroughtValue <= 0) return state;

    // RECEIVE = Customer pays us -> Reduces their debt balance closer to 0
    // GIVE = We advance cash/metal to them -> Increases their debt load
    const balanceDirection = this.txMode === 'RECEIVE' ? 1 : -1;

    if (this.settlementStrategy === 'SPECIFIC') {
      if (this.specificTarget === 'CASH') {
        state.cash += this.totalBroughtValue * balanceDirection;
      } else if (this.specificTarget === 'GOLD') {
        const goldWeightEquivalent = this.totalBroughtValue / this.assetsBrought.goldRate;
        state.gold += goldWeightEquivalent * balanceDirection;
      } else if (this.specificTarget === 'SILVER') {
        const silverWeightEquivalent = this.totalBroughtValue / this.assetsBrought.silverRate;
        state.silver += silverWeightEquivalent * balanceDirection;
      }
    } else {
      // CASCADE SYSTEM FOR NATURAL RECOVERY
      let structuralPool = this.totalBroughtValue;

      for (const target of this.cascadePriority) {
        if (structuralPool <= 0) break;

        if (target === 'CASH' && state.cash < 0) {
          const gap = Math.abs(state.cash);
          const chunk = Math.min(structuralPool, gap);
          state.cash += chunk;
          structuralPool -= chunk;
        } 
        else if (target === 'GOLD' && state.gold < 0) {
          const gapCashVal = Math.abs(state.gold) * this.assetsBrought.goldRate;
          const chunkCash = Math.min(structuralPool, gapCashVal);
          state.gold += (chunkCash / this.assetsBrought.goldRate);
          structuralPool -= chunkCash;
        } 
        else if (target === 'SILVER' && state.silver < 0) {
          const gapCashVal = Math.abs(state.silver) * this.assetsBrought.silverRate;
          const chunkCash = Math.min(structuralPool, gapCashVal);
          state.silver += (chunkCash / this.assetsBrought.silverRate);
          structuralPool -= chunkCash;
        }
      }

      // If funds remain after leveling debts out, deposit remainder into cash balance
      if (structuralPool > 0) {
        state.cash += structuralPool * balanceDirection;
      }
    }
    return state;
  }

  setPriority(index: number, type: 'CASH' | 'GOLD' | 'SILVER') {
    const oldIndex = this.cascadePriority.indexOf(type);
    this.cascadePriority[oldIndex] = this.cascadePriority[index];
    this.cascadePriority[index] = type;
  }

  submitTransaction(): void {
    if (!this.selectedParty || this.totalBroughtValue <= 0) return;

    const finals = this.forecastedBalances;
    const current = this.selectedParty;

    // CORRECTED BACKEND PAYLOAD MAPPING
    // If final balance is GREATER than current balance (e.g., going from -10000 to -5000), it's a CREDIT.
    // If final balance is LESS than current balance (e.g., going from -10000 to -15000), it's a DEBIT.
    const payload: TransactionRequest = {
      description: `${this.descriptionNote} [Strategy: ${this.settlementStrategy}]`,
      cashCredit: finals.cash > current.cashBalance ? (finals.cash - current.cashBalance) : 0,
      cashDebit: finals.cash < current.cashBalance ? (current.cashBalance - finals.cash) : 0,
      
      goldCredit: finals.gold > current.goldBalance ? (finals.gold - current.goldBalance) : 0,
      goldDebit: finals.gold < current.goldBalance ? (current.goldBalance - finals.gold) : 0,
      
      silverCredit: finals.silver > current.silverBalance ? (finals.silver - current.silverBalance) : 0,
      silverDebit: finals.silver < current.silverBalance ? (current.silverBalance - finals.silver) : 0
    };

    this.partyService.processSettlement(current.id, payload).subscribe({
      next: () => {
        this.settled.emit();
        this.resetForm();
      },
      error: (err) => console.error("Settlement tracking engine error:", err)
    });
  }

  // REFACTORED HIGH-FIDELITY WEB-PRINTER AND PDF GENERATOR
  downloadLedgerPDF(): void {
    if (!this.selectedParty) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const p = this.selectedParty;
    const now = new Date();
    
    // Exact Timestamp parsing formatting patterns for file identifiers
    const timestampStr = now.toLocaleDateString('en-IN').replace(/\//g, '-') + '_' + now.toLocaleTimeString('en-IN', { hour12: false }).replace(/:/g, '-');

    let rowsHtml = '';
    this.transactionHistory.forEach(tx => {
      rowsHtml += `
        <tr class="align-middle">
          <td class="whitespace-nowrap">
            <div class="date-txt">${tx.transactionDate.slice(0, 10)}</div>
            <div class="time-txt">${tx.transactionDate.slice(11, 19)}</div>
          </td>
          <td class="font-sans font-bold">#${tx.id}</td>
          <td class="font-sans text-left">${tx.description}</td>
          <td class="text-right text-red">${tx.cashDebit > 0 ? this.fmtINR(tx.cashDebit) : '—'}</td>
          <td class="text-right text-green">${tx.cashCredit > 0 ? this.fmtINR(tx.cashCredit) : '—'}</td>
          <td class="text-right text-gold">${tx.goldDebit > 0 ? this.fmtGold(tx.goldDebit) : '—'}</td>
          <td class="text-right text-red">${tx.goldCredit > 0 ? this.fmtGold(tx.goldCredit) : '—'}</td>
          <td class="text-right text-blue">${tx.silverDebit > 0 ? this.fmtSilver(tx.silverDebit) : '—'}</td>
          <td class="text-right text-red">${tx.silverCredit > 0 ? this.fmtSilver(tx.silverCredit) : '—'}</td>
        </tr>
      `;
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Ledger_${p.name.replace(/\s+/g, '_')}_${timestampStr}</title>
          <style>
            @page { size: A4 landscape; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .header-container { background: #0f172a; color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-between: space-between; align-items: center; }
            .company-title { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px; color: #f8fafc; }
            .company-subtitle { margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .meta-section { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
            .profile-block p { margin: 4px 0; font-size: 13px; color: #334155; font-weight: 500; }
            .profile-block strong { color: #0f172a; font-weight: 700; }
            .balance-card { background: white; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
            .balance-card:last-child { margin-bottom: 0; }
            .balance-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #64748b; tracking: 0.5px; }
            .balance-value { font-family: "Courier New", Courier, monospace; font-size: 14px; font-weight: 900; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
            th { background: #f1f5f9; color: #475569; padding: 10px 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; border-right: 1px solid #e2e8f0; }
            th:last-child { border-right: none; }
            td { padding: 10px 8px; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #f1f5f9; font-family: "Courier New", Courier, monospace; font-size: 12px; font-weight: 600; color: #334155; text-align: center; }
            td:last-child { border-right: none; }
            .text-left { text-align: left !important; }
            .text-right { text-align: right !important; }
            .text-red { color: #dc2626 !important; font-weight: 700; }
            .text-green { color: #16a34a !important; font-weight: 700; }
            .text-gold { color: #b45309 !important; font-weight: 700; }
            .text-blue { color: #1d4ed8 !important; font-weight: 700; }
            .date-txt { font-family: system-ui; font-weight: 700; color: #1e293b; }
            .time-txt { font-size: 10px; color: #64748b; margin-top: 2px; }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div>
              <h1 class="company-title">VRUNDA JEWELLERS</h1>
              <p class="company-subtitle">Double-Entry Core Banking Statement Ledger</p>
            </div>
            <div style="text-align: right; font-size: 12px; color: #94a3b8; font-weight: 500;">
              Printed on: <span style="color: white; font-weight: 700;">${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN')}</span>
            </div>
          </div>

          <div class="meta-section">
            <div class="profile-block">
              <h4 style="margin: 0 0 10px 0; font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Customer Account Coordinates</h4>
              <p><strong>Account Holder:</strong> ${p.name}</p>
              <p><strong>Registered Firm:</strong> ${p.shopName || 'N/A'}</p>
              <p><strong>City Location:</strong> ${p.city}</p>
              <p><strong>Contact Registry:</strong> ${p.contact}</p>
            </div>
            <div>
              <div class="balance-card">
                <span class="balance-label">Cash Book Balance</span>
                <span class="balance-value" style="color: ${p.cashBalance >= 0 ? '#16a34a' : '#dc2626'}">${this.fmtINR(p.cashBalance)}</span>
              </div>
              <div class="balance-card">
                <span class="balance-label">Gold Metal Book Balance</span>
                <span class="balance-value" style="color: #b45309;">${this.fmtGold(p.goldBalance)}</span>
              </div>
              <div class="balance-card">
                <span class="balance-label">Silver Metal Book Balance</span>
                <span class="balance-value" style="color: #1d4ed8;">${this.fmtSilver(p.silverBalance)}</span>
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr style="background: #e2e8f0;">
                <th colspan="3" style="border-right: 2px solid #cbd5e1;">Transaction Details</th>
                <th colspan="2" style="background: #fee2e2; color: #991b1b; border-right: 2px solid #cbd5e1;">Cash Vault Track (INR)</th>
                <th colspan="2" style="background: #fef3c7; color: #92400e; border-right: 2px solid #cbd5e1;">Gold Metallic Track</th>
                <th colspan="2" style="background: #dbeafe; color: #1e40af;">Silver Metallic Track</th>
              </tr>
              <tr>
                <th style="width: 12%;">Timestamp</th>
                <th style="width: 8%;">Voucher ID</th>
                <th class="text-left" style="width: 26%;">Memo Description</th>
                <th class="text-right" style="background: #fef2f2;">Debit (DR)</th>
                <th class="text-right" style="background: #f0fdf4;">Credit (CR)</th>
                <th class="text-right" style="background: #fffbeb;">DR (+)</th>
                <th class="text-right" style="background: #fef2f2;">CR (-)</th>
                <th class="text-right" style="background: #eff6ff;">DR (+)</th>
                <th class="text-right" style="background: #fef2f2;">CR (-)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              setTimeout(letPrint => {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  resetInternalState(): void {
    this.selectedParty = null;
    this.customerSearchTerm = '';
    this.transactionHistory = [];
    this.descriptionNote = 'Counter Settlement';
    this.settlementStrategy = 'SPECIFIC';
    this.specificTarget = 'CASH';
    this.cascadePriority = ['CASH', 'GOLD', 'SILVER'];
    this.assetsBrought = { cash: 0, goldGrams: 0, goldRate: 7200, silverGrams: 0, silverRate: 88 };
  }

  resetForm(): void { this.resetInternalState(); this.close.emit(); }
  fmtINR(val: any): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(val) || 0); }
  fmtGold(val: number): string { return val ? `${val.toFixed(3)} g` : '0 g'; }
  fmtSilver(val: number): string { return val ? `${new Intl.NumberFormat('en-IN').format(Math.round(val))} g` : '0 g'; }
}