// src/app/models/settlement.model.ts
export interface Settlement {
  type: 'BUY' | 'SELL';
  amount: number;
  settled: boolean;
}
