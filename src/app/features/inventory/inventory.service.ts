import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface InventoryParty {
  id: number;
  name: string;
}

export interface InventoryItem {
  id: number;
  metal: 'SILVER' | 'GOLD';
  section: string;
  status: 'STOCK' | 'SOLD' | 'MELTED' | 'BADLO' | 'ORDER'; // Added ORDER
  buyDate: string;
  party?: InventoryParty;
  grossWeightG: number;
  actualPurity: number;
  fineG: number;
  buyRate: number;
  cost: number;
  actualCostPerG: number;
  pendingAmount?: number;
  sale?: {
    date: string;
    sellRate: number;
    profit: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor() { }

  // HELPER TO GENERATE DUMMY DATA
  private generateItems(metal: 'SILVER'|'GOLD', section: string, startId: number, count: number): InventoryItem[] {
    // Status rotation including ORDER
    const statuses: any[] = ['STOCK', 'STOCK', 'STOCK', 'SOLD', 'ORDER', 'MELTED', 'BADLO', 'ORDER'];
    const parties = ['Ramesh Silver', 'Suresh Bullion', 'Mahalaxmi Jewellers', 'Dubai Imports', 'Local Customer', 'Kishan Gold'];
    
    return Array.from({ length: count }).map((_, i) => {
      const id = startId + i;
      const status = statuses[i % statuses.length];
      
      // Random weight between 100g and 5000g
      const weight = Math.floor(Math.random() * 5000) + 100;
      
      // Purity: Gold ~91.6, Silver ~50-99
      const purity = metal === 'GOLD' ? (91.6 + (Math.random() * 8)) : (50 + Math.random() * 50);
      
      const fine = (weight * purity) / 100;
      const rate = metal === 'GOLD' ? 6200000 : 72000; // Rate per kg
      
      return {
        id,
        metal,
        section,
        status,
        buyDate: `2025-02-${(i % 28) + 1}`,
        party: { id: (i % 5) + 1, name: parties[i % parties.length] },
        grossWeightG: parseFloat(weight.toFixed(2)),
        actualPurity: parseFloat(purity.toFixed(2)),
        fineG: parseFloat(fine.toFixed(2)),
        buyRate: rate,
        cost: Math.floor(fine * (rate / 1000)), 
        actualCostPerG: rate / 1000,
        pendingAmount: i % 4 === 0 ? 5000 : 0,
        // Add sale data only if SOLD
        sale: status === 'SOLD' ? { date: '2025-03-01', sellRate: rate + 1200, profit: Math.floor(fine * 1.2) } : undefined
      };
    });
  }

  // MOCK DATA STORAGE
  private mockItems: InventoryItem[] = [
    // SILVER SECTIONS
    ...this.generateItems('SILVER', 'RUPA', 100, 20),
    ...this.generateItems('SILVER', 'CHORSA', 200, 15),
    ...this.generateItems('SILVER', 'JUNU', 300, 10),
    
    // GOLD SECTIONS
    ...this.generateItems('GOLD', 'RANI', 500, 15),
    ...this.generateItems('GOLD', 'IMPORTED', 600, 10),
    ...this.generateItems('GOLD', 'KADU', 700, 5),
  ];

  getItems(): Observable<InventoryItem[]> {
    return of(this.mockItems).pipe(delay(300));
  }
}
