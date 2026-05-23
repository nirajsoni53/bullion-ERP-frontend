import { Component, Input  } from '@angular/core';
import { Item, Expense, Partner, PartnerStat } from './report.model';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
     todayISO = new Date().toISOString().slice(0, 10);

  page = 'REPORTS';

  reportFilter = {
    type: 'DAILY',
    startDate: this.todayISO,
    endDate: this.todayISO
  };

  // DATA (from API / state)
  items: Item[] = [];
  expenses: Expense[] = [];
  partners: Partner[] = [];

  // DERIVED DATA (previously inline JSX)
  sold: Item[] = [];
  exps: Expense[] = [];
  totalProfit = 0;
  totalExp = 0;
  netProfit = 0;
  partnerStats: PartnerStat[] = [];

  // ================= FILTER CHANGE =================
  onReportTypeChange(type: string): void {
    const d = new Date();

    if (type === 'DAILY') {
      this.reportFilter = { type, startDate: this.todayISO, endDate: this.todayISO };
    } else if (type === 'MONTHLY') {
      this.reportFilter = {
        type,
        startDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`,
        endDate: this.todayISO
      };
    } else if (type === 'YEARLY') {
      this.reportFilter = {
        type,
        startDate: `${d.getFullYear()}-01-01`,
        endDate: this.todayISO
      };
    } else {
      this.reportFilter = { ...this.reportFilter, type: 'CUSTOM' };
    }
  }

  // ================= MAIN CALC =================
  generateReport(): void {
    const start = new Date(this.reportFilter.startDate);
    const end = new Date(this.reportFilter.endDate);
    end.setDate(end.getDate() + 1);

    this.sold = this.items.filter(
      i => i.sale && new Date(i.sale.date) >= start && new Date(i.sale.date) < end
    );

    this.exps = this.expenses.filter(
      e => new Date(e.date) >= start && new Date(e.date) < end
    );

    this.totalProfit = this.sold.reduce(
      (s, i) => s + (i.sale?.profit || 0), 0
    );

    this.totalExp = this.exps.reduce(
      (s, e) => s + e.amount, 0
    );

    this.netProfit = this.totalProfit - this.totalExp;

    this.calculatePartners(start, end);
  }

  // ================= PARTNER LOGIC (UNCHANGED) =================
  calculatePartners(start: Date, end: Date): void {
    const activePartners = this.partners.filter(p => p.status === 'ACTIVE');

    this.partnerStats = activePartners.map(p => {
      let totalWeightedCap = 0;

      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const dIso = d.toISOString().slice(0, 10);

        const pInv = p.investments?.filter(c => c.status === 'active' && c.date <= dIso) || [];
        const pBal = pInv.reduce(
          (acc, c) => c.type === 'INVEST' ? acc + c.amount : acc - c.amount, 0
        );

        let totalBal = 0;
        activePartners.forEach(ap => {
          const apInv = ap.investments?.filter(c => c.status === 'active' && c.date <= dIso) || [];
          totalBal += apInv.reduce(
            (acc, c) => c.type === 'INVEST' ? acc + c.amount : acc - c.amount, 0
          );
        });

        if (totalBal > 0) {
          totalWeightedCap += (pBal / totalBal) * this.netProfit;
        }
      }

      const basePercent = 100 / activePartners.length;
      const deductedPercent =
        p.type === 'PASSIVE'
          ? basePercent * (1 - p.deductionPercent / 100)
          : basePercent;

      return {
        ...p,
        basePercent,
        deductedPercent,
        rawShare: (basePercent / 100) * this.netProfit,
        finalShare: (deductedPercent / 100) * this.netProfit
      };
    });
  }

  // ================= UTIL =================
  fmtINR(v: number): string {
    return '₹' + v.toLocaleString('en-IN');
  }

  fmtNum(v: number): string {
    return Number(v).toFixed(2);
  }
}
