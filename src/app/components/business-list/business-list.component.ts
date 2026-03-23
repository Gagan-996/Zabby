import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-business-list',
  imports: [CommonModule],
  templateUrl: './business-list.component.html',
  styleUrl: './business-list.component.css'
})
export class BusinessListComponent {
  openDropdown: 'area' | 'type' | 'open' | 'verified' | null = null;

  toggleDropdown(name: 'area' | 'type' | 'open' | 'verified', event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  closeDropdowns() {
    this.openDropdown = null;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.closeDropdowns();
  }
}
