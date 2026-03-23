import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';


@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  categories: any;
  nearByBusiness:any;
  selectedCategory: any;
  showAll: boolean = false;
  isCategoriesLoading: boolean = true;
  isBusinessLoading: boolean = true;
  categorySkeletons = Array.from({ length: 8 });
  businessSkeletons = Array.from({ length: 4 });
  categoryImageLoaded: boolean[] = [];
  businessImageLoaded: boolean[] = [];
  imageBaseUrl: string = '';
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {
    this.imageBaseUrl = this.api.imageUrl
  }

  ngOnInit(): void {
    this.api
      .get<unknown>('categories/get-featured', 'categories')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res:any) => {
            this.categories = res.data
            if (!this.selectedCategory && Array.isArray(this.categories) && this.categories.length > 0) {
              this.selectedCategory = this.categories[0];
            }
            if (Array.isArray(this.categories)) {
              this.categoryImageLoaded = this.categories.map(() => false);
            }
            this.isCategoriesLoading = false;
        },
        error: () => {
          // Keep defaults on error
          this.isCategoriesLoading = false;
        }
      });
      this.getNearByBusiness()
  }

  getNearByBusiness(){
        this.api
      .get<unknown>(`businesses/nearby?lat=22.736664&lng=75.910713`, 'buisnesses')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res:any) => {
            this.nearByBusiness = res.data
            console.log(this.nearByBusiness);
            if (Array.isArray(this.nearByBusiness)) {
              this.businessImageLoaded = this.nearByBusiness.map(() => false);
            }
            this.isBusinessLoading = false;
        },
        error: () => {
          // Keep defaults on error
          this.isBusinessLoading = false;
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

  onCategoryImageLoad(index: number): void {
    this.categoryImageLoaded[index] = true;
  }

  onBusinessImageLoad(index: number): void {
    this.businessImageLoaded[index] = true;
  }

  onImageError(index: number, type: 'category' | 'business'): void {
    if (type === 'category') {
      this.categoryImageLoaded[index] = true;
    } else {
      this.businessImageLoaded[index] = true;
    }
  }
}
