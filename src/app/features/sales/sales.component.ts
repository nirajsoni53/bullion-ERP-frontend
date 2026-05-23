import { Component, Input } from '@angular/core';
import { Party } from '../models/party.model'
import { Item } from '../models/item.model'
import { Settlement } from '../models/settlement.model'

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.scss'
})
export class SalesComponent {
  @Input() items: Item[] = [];
  @Input() parties: Party[] = [];

  searchText = '';

  /* ---------------- HELPERS ---------------- */

  get sales(): Item[] {
    return this.items.filter(i => i.status === 'SOLD');
  }

  get filteredSales(): Item[] {
    const text = this.searchText.toLowerCase();

    return this.sales.filter(i => {
      const partyName =
        this.parties.find(p => p.id === i.sale?.soldToPartyId)?.name ?? '';
      return (
        i.id.toString().includes(text) ||
        partyName.toLowerCase().includes(text)
      );
    });
  }

  getPartyName(item: Item): string {
    return (
      this.parties.find(p => p.id === item.sale?.soldToPartyId)?.name ?? '-'
    );
  }

getSalePending(item: Item): number {
  const settled =
    item.settlements
      ?.filter(
        (s): s is Settlement =>
          s.type === 'SELL' && s.settled
      )
      .reduce((sum: number, s: Settlement) => sum + s.amount, 0) ?? 0;

  return (item.sale?.sellAmount ?? 0) - settled;
}

  /* ----------- FORMATTERS (SAFE) ----------- */

  fmtINR(v: number | undefined): string {
    return (v ?? 0).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  }

  fmtNum(v: number | undefined): string {
    return (v ?? 0).toLocaleString('en-IN');
  }

  /* -------------- ACTIONS ---------------- */

  openItemDetails(id: number): void {
    console.log('Open details', id);
  }

  openSettlement(id: number): void {
    console.log('Open settlement', id);
  }
}
