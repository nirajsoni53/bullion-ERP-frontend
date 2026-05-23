import { Component } from '@angular/core';

@Component({
  selector: 'app-partners',
  templateUrl: './partners.component.html',
  styleUrl: './partners.component.scss'
})
export class PartnersComponent {
  page = 'PARTNERS';

  todayISO = new Date().toISOString().split('T')[0];

  partners: any[] = [];
  items: any[] = [];

  modals = {
    partnerMgmt: false,
    partnerDashboard: false,
    partnerReport: false
  };

  viewPartnerId: number | null = null;
  partnerForm: any = { name: '', type: 'ACTIVE', deductionPercent: 0, joinDate: this.todayISO, initialAmount: '' };

  // ----------------- Methods -----------------

  openNewPartnerForm() {
    this.partnerForm = { name: '', type: 'ACTIVE', deductionPercent: 0, joinDate: this.todayISO, initialAmount: '' };
    this.modals.partnerMgmt = true;
  }

  openPartnerDashboard(partnerId: number) {
    this.viewPartnerId = partnerId;
    this.modals.partnerDashboard = true;
  }

  openPartnerReport(partnerId: number) {
    this.viewPartnerId = partnerId;
    this.modals.partnerReport = true;
  }

  editPartner(p: any) {
    this.partnerForm = { ...p };
    this.modals.partnerMgmt = true;
  }

  // ----------------- Calculations -----------------
  getActiveInvestments(p: any): any[] {
    return p.investments?.filter((x: any) => x.status === 'active') || [];
  }

  getTotalInvested(p: any): number {
    const active = this.getActiveInvestments(p);
    return active.reduce((sum: number, x: any) => sum + ((x.type === 'INVEST' ? x.amount : -x.amount) || 0), 0);
  }

  getDaysSinceJoin(joinDate: string) {
    return Math.ceil((new Date().getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24));
  }

  getSharePercent(p: any): number {
    const activePartners = this.partners.filter(x => x.status === 'ACTIVE');
    const totalAllPartners = activePartners.reduce((s: number, x: any) => {
      const inv = x.investments?.filter((i: any) => i.status === 'active') || [];
      return s + inv.reduce((ss: number, i: any) => ss + ((i.type === 'INVEST' ? i.amount : -i.amount) || 0), 0);
    }, 0);

    const totalInvested = this.getTotalInvested(p);
    return totalAllPartners > 0 ? (totalInvested / totalAllPartners) * 100 : 0;
  }

  getTypeClass(type: string) {
    return type === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700';
  }

  getStatusClass(status: string) {
    return status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700';
  }

  fmtINR(amount: number) { return amount; }
  fmtNum(value: number) { return value; }
}
