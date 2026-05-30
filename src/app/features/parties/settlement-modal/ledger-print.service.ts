import { Injectable } from '@angular/core';
import { Party, LedgerTransaction } from '../party.service';

@Injectable({
  providedIn: 'root'
})
export class LedgerPrintService {

  public printLandscapeLedger(party: Party, transactions: LedgerTransaction[]): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Plase allow popups to download/print the statement ledger sheet.');
      return;
    }

    const now = new Date();
    // Dynamic Timestamp Generation: DD-MM-YYYY_HH-MM-SS
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const formattedTimestamp = `${day}-${month}-${year}_${timeStr}`;

    let rowsHtml = '';
    transactions.forEach(tx => {
      rowsHtml += `
        <tr class="align-middle">
          <td style="white-space: nowrap;">
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
          <title>Ledger_${party.name.replace(/\s+/g, '_')}_${formattedTimestamp}</title>
          <style>
            @page { size: A4 landscape; margin: 10mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .header-container { background: #0f172a; color: white; padding: 20px 24px; border-radius: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .company-title { margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 0.5px; color: #f8fafc; }
            .company-subtitle { margin: 4px 0 0 0; font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .meta-section { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px; }
            .profile-block p { margin: 6px 0; font-size: 13px; color: #334155; font-weight: 500; }
            .profile-block strong { color: #0f172a; font-weight: 700; }
            .balance-card { background: white; border: 1px solid #e2e8f0; padding: 8px 14px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
            .balance-card:last-child { margin-bottom: 0; }
            .balance-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
            .balance-value { font-family: "Courier New", Courier, monospace; font-size: 13px; font-weight: 900; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 5px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; }
            th { background: #f1f5f9; color: #475569; padding: 10px 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; border-right: 1px solid #e2e8f0; text-align: center; }
            th:last-child { border-right: none; }
            td { padding: 8px 6px; border-bottom: 1px solid #e2e8f0; border-right: 1px solid #f1f5f9; font-family: "Courier New", Courier, monospace; font-size: 11px; font-weight: 600; color: #334155; text-align: center; }
            td:last-child { border-right: none; }
            .text-left { text-align: left !important; }
            .text-right { text-align: right !important; }
            .text-red { color: #dc2626 !important; font-weight: 700; }
            .text-green { color: #16a34a !important; font-weight: 700; }
            .text-gold { color: #b45309 !important; font-weight: 700; }
            .text-blue { color: #1d4ed8 !important; font-weight: 700; }
            .date-txt { font-family: system-ui; font-weight: 700; color: #1e293b; }
            .time-txt { font-size: 10px; color: #64748b; margin-top: 1px; }
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
              <h4 style="margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Customer Account Coordinates</h4>
              <p><strong>Account Holder:</strong> ${party.name}</p>
              <p><strong>Registered Firm:</strong> ${party.shopName || 'N/A'}</p>
              <p><strong>City Location:</strong> ${party.city}</p>
              <p><strong>Contact Registry:</strong> ${party.contact}</p>
            </div>
            <div>
              <div class="balance-card">
                <span class="balance-label">Cash Book Balance</span>
                <span class="balance-value" style="color: ${party.cashBalance >= 0 ? '#16a34a' : '#dc2626'}">${this.fmtINR(party.cashBalance)}</span>
              </div>
              <div class="balance-card">
                <span class="balance-label">Gold Book Balance</span>
                <span class="balance-value" style="color: #b45309;">${this.fmtGold(party.goldBalance)}</span>
              </div>
              <div class="balance-card">
                <span class="balance-label">Silver Book Balance</span>
                <span class="balance-value" style="color: #1d4ed8;">${this.fmtSilver(party.silverBalance)}</span>
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
                <th style="width: 14%;">Timestamp (DD-MM-YYYY)</th>
                <th style="width: 9%;">Voucher ID</th>
                <th class="text-left" style="width: 25%;">Memo Description</th>
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
              setTimeout(() => {
                window.print();
                window.close();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  private fmtINR(val: any): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(parseFloat(val) || 0); }
  private fmtGold(val: number): string { return val ? `${val.toFixed(3)} g` : '0 g'; }
  private fmtSilver(val: number): string { return val ? `${new Intl.NumberFormat('en-IN').format(Math.round(val))} g` : '0 g'; }
}