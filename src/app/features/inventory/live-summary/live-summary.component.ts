import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-live-summary',
  templateUrl: './live-summary.component.html',
  styleUrl: './live-summary.component.scss'
})
export class LiveSummaryComponent {
  @Input() formData: any;
  Math = Math;
  fmtINR(v: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v); }
}