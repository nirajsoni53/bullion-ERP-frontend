// src/app/models/sale.model.ts
export interface Sale {
  sellAmount: number;
  sellRate: number;
  profit?: number;
  date: string;
  soldToPartyId?: number;
}
