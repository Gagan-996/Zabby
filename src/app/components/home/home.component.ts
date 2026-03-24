import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { LocationService } from '../../services/location.service';
import { SmartImageDirective } from '../../helper/smart-image.directive';

@Component({
  selector: 'app-home',
  imports: [CommonModule, SmartImageDirective],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isBrowser = false;

  categories: any;
  nearByBusiness: any[] = [];
  selectedCategory: any;
  showAll: boolean = false;
  isCategoriesLoading: boolean = true;
  isBusinessLoading: boolean = true;
  categorySkeletons = Array.from({ length: 8 });
  businessSkeletons = Array.from({ length: 4 });
  imageBaseUrl: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private locationService: LocationService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.imageBaseUrl = this.api.imageUrl;
  }

  
  ngOnInit(): void {
  this.isBrowser = isPlatformBrowser(this.platformId);
   if (this.isBrowser) {
    this.loadNearbyBusinesses();
  }
    this.api
      .get<unknown>('categories/get-featured', 'categories')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.categories = res.data;
          if (!this.selectedCategory && Array.isArray(this.categories) && this.categories.length > 0) {
            this.selectedCategory = this.categories[0];
          }
          this.isCategoriesLoading = false;
        },
        error: () => {
          this.isCategoriesLoading = false;
        }
      });

    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get visibleCategories(): any[] {
    const list = this.categories ?? [];
    return this.showAll ? list : list.slice(0, 14);
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  selectCategory(category: any): void {
    this.selectedCategory = category;
  }

loadNearbyBusinesses() {
  this.isBusinessLoading = true;

  this.locationService.getCurrentLocation()
    .then((loc) => {

      const lat = loc?.lat;
      const lng = loc?.lng;

      if (lat && lng) {
        this.callApi(lat, lng);
      } else {
        this.callApi(22.7196, 75.8577); // fallback (Indore)
      }

    })
    .catch(() => {
      this.callApi(22.7196, 75.8577); // fallback
    });
}

 callApi(lat: number, lng: number) {
  this.api
    .get(`businesses/nearby?lat=${lat}&lng=${lng}`)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        this.nearByBusiness = res?.success ? res.data : [];
        this.isBusinessLoading = false;
      },
      error: () => {
        this.nearByBusiness = [];
        this.isBusinessLoading = false;
      }
    });
}





 
}
