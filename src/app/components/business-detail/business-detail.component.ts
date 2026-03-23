import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-business-detail',
  imports: [CommonModule],
  templateUrl: './business-detail.component.html',
  styleUrl: './business-detail.component.css'
})
export class BusinessDetailComponent {
  isLoading = false;

  products = [
    'Tempered glass',
    'Membrane',
    'UV glass',
    'Earphone',
    'Headphones',
    'Earbuds',
    'Smart watch',
    'Neckband',
    'Mobile cover',
    'Mobile skin',
    'Laptop skin',
    'Mobile charge',
    'Data cable',
    'Charging cable',
    'Watch strap',
    'Watch strap',
    'Watch strap'
  ];

  workingHours = [
    { day: 'Monday', slots: ['8:30 AM - 10:00 AM', '8:30 AM - 10:00 AM'], closed: false },
    { day: 'Tuesday', slots: ['8:30 AM - 10:00 AM', '8:30 AM - 10:00 AM', '8:30 AM - 10:00 AM', '8:30 AM - 10:00 AM'], closed: false },
    { day: 'Wednesday', slots: ['8:30 AM - 10:00 AM', '8:30 AM - 10:00 AM'], closed: false },
    { day: 'Sunday', slots: [], closed: true }
  ];

  relatedBusinesses = [
    { name: 'Hidayah Mobile and accessories', imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=900&auto=format&fit=crop' },
    { name: 'Hidayah Mobile and accessories', imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=900&auto=format&fit=crop' },
    { name: 'Hidayah Mobile and accessories', imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=900&auto=format&fit=crop' }
  ];
}
