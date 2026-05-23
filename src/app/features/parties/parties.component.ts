import { Component, OnInit } from '@angular/core';
import { PartyService, Party } from './party.service';

@Component({
  selector: 'app-parties',
  templateUrl: './parties.component.html',
})
export class PartiesComponent implements OnInit {

  page = 'PARTIES';
  
  // Data
  allParties: Party[] = [];
  filteredParties: Party[] = [];
  paginatedParties: Party[] = [];

  // Filter State
  searchTerm = '';
  balanceFilter: 'ALL' | 'RECEIVABLE' | 'PAYABLE' | 'SETTLED' = 'ALL';

  // Pagination State
  currentPage = 1;
  pageSize = 10;

  // Modal State
  isModalOpen = false;
  isSaving = false;
  currentPartyId: number | null = null;
  editingPartyData: any = null;

  // Delete State
  isDeleteModalOpen = false;
  isDeleting = false;
  partyToDelete: Party | null = null;

  constructor(private partyService: PartyService) {}

  ngOnInit() { this.loadParties(); }

  loadParties() {
    this.partyService.getParties().subscribe(data => {
      this.allParties = data;
      this.applyFilters();
    });
  }

  // --- FILTERS & PAGINATION ---
  onSearchChange(term: string) { this.searchTerm = term; this.applyFilters(); }
  setBalanceFilter(filter: any) { this.balanceFilter = filter; this.applyFilters(); }

  applyFilters() {
    let temp = this.allParties;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      temp = temp.filter(p => p.name.toLowerCase().includes(term) || p.shopName.toLowerCase().includes(term) || p.city.toLowerCase().includes(term) || p.contact.includes(term));
    }
    if (this.balanceFilter !== 'ALL') {
      temp = temp.filter(p => {
        if (this.balanceFilter === 'SETTLED') return p.stats.pendingAmount === 0;
        if (this.balanceFilter === 'RECEIVABLE') return p.stats.pendingAmount > 0;
        if (this.balanceFilter === 'PAYABLE') return p.stats.pendingAmount < 0;
        return true;
      });
    }
    this.filteredParties = temp;
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedParties = this.filteredParties.slice(start, start + this.pageSize);
  }
  setPage(page: number) { this.currentPage = page; this.updatePagination(); }
  onPageSizeChange(size: number) { this.pageSize = size; this.currentPage = 1; this.updatePagination(); }

  // --- FORM HANDLERS ---
  openCreateModal() { this.currentPartyId = null; this.editingPartyData = null; this.isModalOpen = true; }
  
  openEditModal(party: Party) { 
    this.currentPartyId = party.id; 
    this.editingPartyData = { ...party }; // Clone data 
    this.isModalOpen = true; 
  }
  
  closeModal() { this.isModalOpen = false; }

  handleSaveParty(formData: any) {
    this.isSaving = true;
    const obs = this.currentPartyId 
      ? this.partyService.updateParty(this.currentPartyId, formData) 
      : this.partyService.addParty(formData);
      
    obs.subscribe({
      next: () => { this.loadParties(); this.isSaving = false; this.closeModal(); },
      error: () => { this.isSaving = false; alert('Failed'); }
    });
  }

  // --- DELETE HANDLERS ---
  initiateDelete(party: Party) { this.partyToDelete = party; this.isDeleteModalOpen = true; }
  closeDeleteModal() { this.isDeleteModalOpen = false; this.partyToDelete = null; }
  
  confirmDelete() {
    if (!this.partyToDelete) return;
    this.isDeleting = true;
    this.partyService.deleteParty(this.partyToDelete.id).subscribe({
      next: () => { this.loadParties(); this.isDeleting = false; this.closeDeleteModal(); },
      error: () => { this.isDeleting = false; }
    });
  }

  viewPartyDetails(id: number) { console.log('View', id); }
}
