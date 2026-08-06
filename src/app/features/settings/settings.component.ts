import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface BullionSettings {
  name: string;
  tagline: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  isGstEnabled: boolean;
  gstRate: number;
  gstin: string;
  pan: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  logo: string;
  terms: string;
}

// Format validation for 15-character Indian GSTIN
export function gstinValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  return gstinRegex.test(control.value) ? null : { invalidGstin: true };
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  logoPreview: string | null = null;
  toastMessage: string | null = null;
  
  isLoadingBankDetails: boolean = false;
  ifscError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupGstToggleListener();
    this.loadSettings();
  }

  private initForm(): void {
    this.settingsForm = this.fb.group({
      name: ['', Validators.required],
      tagline: [''],
      address: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', [Validators.pattern('^[0-9]{6}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.email]],
      
      isGstEnabled: [true],
      gstRate: [3, [Validators.required, Validators.min(0), Validators.max(100)]],
      gstin: ['', [gstinValidator]],
      
      pan: ['', [Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      bankName: [''],
      accountHolderName: [''],
      accountNumber: [''],
      ifscCode: ['', [Validators.pattern('^[A-Z]{4}0[A-Z0-9]{6}$')]],
      branchName: [''],
      logo: [''],
      terms: ['1. Goods once sold will not be taken back.\n2. Subject to local jurisdiction.']
    });
  }

  // Auto-Fetch Bank & Branch via IFSC
  onIfscChange(): void {
    const ifscControl = this.settingsForm.get('ifscCode');
    const ifsc = ifscControl?.value?.trim()?.toUpperCase();

    this.ifscError = null;

    if (ifscControl?.valid && ifsc && ifsc.length === 11) {
      this.isLoadingBankDetails = true;

      this.http.get<any>(`https://ifsc.razorpay.com/${ifsc}`).pipe(
        catchError(() => {
          this.ifscError = 'Invalid IFSC code or bank not found';
          this.isLoadingBankDetails = false;
          return of(null);
        })
      ).subscribe(res => {
        this.isLoadingBankDetails = false;
        if (res) {
          this.settingsForm.patchValue({
            bankName: res.BANK,
            branchName: res.BRANCH
          });
        }
      });
    }
  }

  private setupGstToggleListener(): void {
    this.settingsForm.get('isGstEnabled')?.valueChanges.subscribe((enabled: boolean) => {
      const gstinControl = this.settingsForm.get('gstin');
      const gstRateControl = this.settingsForm.get('gstRate');

      if (enabled) {
        gstinControl?.setValidators([gstinValidator]);
        gstRateControl?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        gstinControl?.enable();
        gstRateControl?.enable();
      } else {
        gstinControl?.clearValidators();
        gstRateControl?.clearValidators();
        gstinControl?.disable();
        gstRateControl?.disable();
      }

      gstinControl?.updateValueAndValidity();
      gstRateControl?.updateValueAndValidity();
    });
  }

  private loadSettings(): void {
    const saved = localStorage.getItem('bullion_settings');
    if (saved) {
      try {
        const parsed: BullionSettings = JSON.parse(saved);
        this.settingsForm.patchValue(parsed);
        if (parsed.logo) {
          this.logoPreview = parsed.logo;
        }

        if (parsed.isGstEnabled === false) {
          this.settingsForm.get('gstin')?.disable();
          this.settingsForm.get('gstRate')?.disable();
        }
      } catch (e) {
        console.error('Error loading settings', e);
      }
    }
  }

  get currentGstRate(): number {
    return this.settingsForm.get('isGstEnabled')?.value ? (this.settingsForm.get('gstRate')?.value || 0) : 0;
  }

  get sampleSubtotal(): number {
    return 75000;
  }

  get sampleGstAmount(): number {
    return (this.sampleSubtotal * this.currentGstRate) / 100;
  }

  get sampleGrandTotal(): number {
    return this.sampleSubtotal + this.sampleGstAmount;
  }

  onLogoUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
        this.settingsForm.patchValue({ logo: this.logoPreview });
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(): void {
    this.logoPreview = null;
    this.settingsForm.patchValue({ logo: '' });
  }

  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      return;
    }

    const payload: BullionSettings = this.settingsForm.getRawValue();
    localStorage.setItem('bullion_settings', JSON.stringify(payload));
    this.showToast('Settings saved successfully!');
  }

  private showToast(msg: string): void {
    this.toastMessage = msg;
    setTimeout(() => {
      this.toastMessage = null;
    }, 3000);
  }
}