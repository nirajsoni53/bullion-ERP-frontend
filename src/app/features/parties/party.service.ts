import { Injectable } from '@angular/core';
import { Observable, of} from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface Party {
  id: number;
  name: string;
  shopName: string;
  city: string;
  contact: string;
  cashBalance: number;
  goldBalance: number;
  silverBalance: number;
  totalBuy: number;
  totalSell: number;
}

export interface LedgerTransaction {
  id: number;
  transactionDate: string;
  description: string;
  cashDebit: number;
  cashCredit: number;
  goldDebit: number;
  goldCredit: number;
  silverDebit: number;
  silverCredit: number;
  runningCash: number;
  runningGold: number;
  runningSilver: number;
}

export interface TransactionRequest {
  actionType: 'RECEIVE' | 'GIVE';
  description: string;
  cash: number;
  goldGrams: number;
  goldRate: number;
  silverGrams: number;
  silverRate: number;
}

export interface UnsettledTransaction {
  id: number;
  date: string;
  description: string;
  pendingAmount: number;
  isSelected?: boolean;
  settleAmount?: number;
  type?: 'CASH' | 'GOLD' | 'SILVER';
}

@Injectable({ providedIn: 'root' })
export class PartyService {
  private apiUrl = 'http://localhost:8081/api/parties'; 

  constructor(private http: HttpClient) { }

  getParties(): Observable<Party[]> { return this.http.get<Party[]>(this.apiUrl); }
  addParty(party: Partial<Party>): Observable<Party> { return this.http.post<Party>(this.apiUrl, party); }
  updateParty(id: number, party: Partial<Party>): Observable<Party> { return this.http.put<Party>(`${this.apiUrl}/${id}`, party); }
  deleteParty(id: number): Observable<void> { return this.http.delete<void>(`${this.apiUrl}/${id}`); }

  // --- NEW SETTLEMENT APIS ---
  getPartyTransactions(partyId: number): Observable<LedgerTransaction[]> {
    return this.http.get<LedgerTransaction[]>(`${this.apiUrl}/${partyId}/transactions`);
  }

  processSettlement(partyId: number, data: TransactionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/${partyId}/settle`, data);
  }

  getUnsettledHistory(partyId: number): Observable<UnsettledTransaction[]> {
    // REAL API (Uncomment when backend is ready):
    // return this.http.get<UnsettledTransaction[]>(`${this.apiUrl}/${partyId}/unsettled`);
    
    // MOCK DATA FOR TESTING (Remove this after backend is ready)
    return of(this.getMockUnsettledData(partyId));
  }

  // HELPER: Mock Unsettled Data Generator
  private getMockUnsettledData(partyId: number): UnsettledTransaction[] {
    // Generate different mock data based on partyId
    if (partyId === 1) {
      return [
        { id: 101, date: '2026-01-15', description: 'Gold Purchase (10g)', pendingAmount: 5000 },
        { id: 102, date: '2026-01-22', description: 'Silver Inward (500g)', pendingAmount: -12000 },
        { id: 103, date: '2026-02-01', description: 'Cash Advance', pendingAmount: 3000 },
        { id: 104, date: '2026-01-22', description: 'Silver Inward (200g)', pendingAmount: -3000 },
        { id: 105, date: '2026-01-22', description: 'Silver Inward (300g)', pendingAmount: 6000 }
      ];
    } else if (partyId === 2) {
      return [
        { id: 201, date: '2026-01-10', description: 'Old Stock Settlement', pendingAmount: -8000 },
        { id: 202, date: '2026-01-28', description: 'Partial Payment', pendingAmount: 2000 }
      ];
    }
    
    // No unsettled items for other parties
    return [];
  }

  getPartyTransactionsPaged(
    partyId: number,
    fromDate: string,
    toDate: string,
    page: number,
    size: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    // Only append date filters if they have values filled by the user
    if (fromDate) {
      params = params.set('fromDate', fromDate);
    }
    if (toDate) {
      params = params.set('toDate', toDate);
    }

    return this.http.get<any>(`${this.apiUrl}/${partyId}/transactions`, { params });
  }
}