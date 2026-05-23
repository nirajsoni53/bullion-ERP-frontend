// party-form.component.ts
import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-party-form',
  templateUrl: './party-form.component.html',
  styleUrl: './party-form.component.scss'
})
export class PartyFormComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() isSaving = false;
  @Input() partyId: number | null = null;
  @Input() initialData: any = {};
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  formData = { name: '', shopName: '', city: '', contact: '' };
  errors = { name: false, contact: false, shopName: false, city: false };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      // Reset form when modal opens
      this.formData = this.initialData ? { ...this.initialData } : { name: '', shopName: '', city: '', contact: '' };
      this.errors = { name: false, contact: false, shopName: false, city: false };
    }
  }

  submit() {
    // 1. Reset Errors
    this.errors = { name: false, contact: false, shopName: false, city: false };
    let isValid = true;

    // 2. Validate Inputs
    if (!this.formData.name || !this.formData.name.trim()) { 
      this.errors.name = true; 
      isValid = false; 
    }
    
    // Check for null/undefined contact before checking length
    if (!this.formData.contact || !this.formData.contact.trim() || this.formData.contact.length < 10) { 
      this.errors.contact = true; 
      isValid = false; 
    }
    
    if (!this.formData.shopName || !this.formData.shopName.trim()) { 
      this.errors.shopName = true; 
      isValid = false; 
    }
    
    if (!this.formData.city || !this.formData.city.trim()) { 
      this.errors.city = true; 
      isValid = false; 
    }

    // 3. Prepare Payload if Valid
    if (isValid) {
      // Create a clean object to send to the API
      const apiPayload = {
        // Copy form fields
        name: this.formData.name,
        shopName: this.formData.shopName,
        city: this.formData.city,
        contact: this.formData.contact,
        
        // HARDCODE STATS TO 0 TO PREVENT BACKEND ERROR
        // This ensures Java primitives (int, double) never get 'null'
        totalBuy: 0,
        totalSell: 0,
        pendingAmount: 0.0
      };

      // Emit the event with the safe payload
      this.save.emit(apiPayload);
    }
  }
}
