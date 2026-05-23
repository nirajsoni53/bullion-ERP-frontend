import { Sale } from './sale.model';
import { Settlement } from './settlement.model';

export interface Item {
  id: number;
  itemName: string;
  status: 'STOCK' | 'SOLD';
  cost: number;

  // Dates
  buyDate?: string;

  // Weight & purity details
  grossWeightG?: number;      // Total weight in grams
  actualPurity?: number;      // Actual purity %
  paidPurity?: number;        // Paid purity %
  fineG?: number;             // Fine gold in grams

  // Rates
  buyRate?: number;
  actualCostPerG?: number;

  // Sale info
  sale?: Sale;

  // Settlements
  settlements?: Settlement[];
}

