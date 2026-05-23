export interface Sale {
  date: string;
  sellAmount: number;
  profit: number;
}

export interface Item {
  id: number;
  itemName: string;
  cost: number;
  sale?: Sale;
}

export interface Expense {
  id: number;
  date: string;
  title: string;
  amount: number;
}

export interface Investment {
  status: 'active' | 'inactive';
  date: string;
  type: 'INVEST' | 'WITHDRAW';
  amount: number;
}

export interface Partner {
  id: number;
  name: string;
  type: 'ACTIVE' | 'PASSIVE';
  status: 'ACTIVE' | 'INACTIVE';
  deductionPercent: number;
  investments?: Investment[];
}

/** Computed partner row (React return object) */
export interface PartnerStat extends Partner {
  basePercent: number;
  deductedPercent: number;
  rawShare: number;
  finalShare: number;
}
