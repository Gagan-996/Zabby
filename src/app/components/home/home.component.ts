import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Inject, OnDestroy, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { LocationService } from '../../services/location.service';
import { SmartImageDirective } from '../../helper/smart-image.directive';
import {
  FeaturedCategoriesResponse,
  FeaturedCategory,
  HomeCategoryNavigationState,
  NearbyBusiness,
  NearbyBusinessesResponse
} from '../../models/home.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, SmartImageDirective, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly popularServiceLimit = 5;
  private readonly businessScrollDistance = 280;

  @ViewChild('categorySwiper') categorySwiper?: ElementRef<HTMLElement & {
    swiper?: { slideNext: () => void };
    shadowRoot?: ShadowRoot;
  }>;
  @ViewChild('nearbyBusinessSwiper') nearbyBusinessSwiper?: ElementRef<HTMLElement & {
    swiper?: { slideNext: () => void };
    shadowRoot?: ShadowRoot;
  }>;

  isBrowser = false;
  serviceAgentsCategory: FeaturedCategory[] = [];
  categories: FeaturedCategory[] = [];
  nearByBusiness: NearbyBusiness[] = [];
  selectedCategory: FeaturedCategory | null = null;
  isBusinessLoading = true;
  businessSkeletons = Array.from({ length: 4 });
  imageBaseUrl = '';
  private destroy$ = new Subject<void>();

  constructor(
    private api: ApiService,
    private locationService: LocationService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.imageBaseUrl = this.api.imageUrl;
  }

  
  ngOnInit(): void {
    this.getCategories();
  this.isBrowser = isPlatformBrowser(this.platformId);
   if (this.isBrowser) {
    this.loadNearbyBusinesses();
  }
   

    
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectCategory(category: FeaturedCategory): void {
    this.selectedCategory = category;
    const route = this.buildCategoryRoute(category);

    if (!route) {
      return;
    }

    const navigationState: HomeCategoryNavigationState = {
      categorySlug: category.slug,
      endingWith: category.ending_with,
      categoryName: category.name
    };

    this.router.navigateByUrl(`/${route}`, {
      state: navigationState
    });
  }

  private buildCategoryRoute(category: FeaturedCategory): string {
    const slug = this.toRoutePart(category.slug);
    const endingWith = this.toRoutePart(category.ending_with);

    if (!slug) {
      return '';
    }

    return endingWith ? `${slug}-${endingWith}-near-me` : `${slug}-near-me`;
  }

  private toRoutePart(value: string | null | undefined): string {
    return (value ?? '')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  scrollCategories(): void {
    this.scrollSwiper(this.categorySwiper);
  }

  scrollNearbyBusinesses(): void {
    this.scrollSwiper(this.nearbyBusinessSwiper, this.businessScrollDistance);
  }

  get visibleServiceAgentsCategory(): FeaturedCategory[] {
    return this.serviceAgentsCategory.slice(0, this.popularServiceLimit);
  }

  get hasMoreServiceAgentsCategory(): boolean {
    return this.serviceAgentsCategory.length > this.popularServiceLimit;
  }

  viewAllPopularServices(): void {
    this.router.navigate(['/businesses']);
  }

  private scrollSwiper(
    swiperRef: ElementRef<HTMLElement & { swiper?: { slideNext: () => void }; shadowRoot?: ShadowRoot }> | undefined,
    fallbackDistance = 180
  ): void {
    if (!this.isBrowser) {
      return;
    }

    const swiperHost = swiperRef?.nativeElement;
    const swiperInstance = swiperHost?.swiper;

    if (swiperInstance?.slideNext) {
      swiperInstance.slideNext();
      return;
    }

    const swiperContainer = swiperHost?.shadowRoot?.querySelector('.swiper') as HTMLElement | null;
    if (swiperContainer) {
      swiperContainer.scrollBy({ left: fallbackDistance, behavior: 'smooth' });
    }
  }

  loadNearbyBusinesses(): void {
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

  callApi(lat: number, lng: number): void {
    this.api
      .get<NearbyBusinessesResponse>(`businesses/nearby?lat=${lat}&lng=${lng}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.nearByBusiness = res.success ? res.data : [];
          this.isBusinessLoading = false;
        },
        error: () => {
          this.nearByBusiness = [];
          this.isBusinessLoading = false;
        }
      });
  }

  getCategories(): void {
    this.api
      .get<FeaturedCategoriesResponse>('categories/get-featured', 'categories')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.categories = res.success ? res.data : [];
          this.serviceAgentsCategory = this.categories.filter((cat) => cat.category_kind === 'service_agent');
          if (!this.selectedCategory && this.categories.length > 0) {
            this.selectedCategory = this.categories[0];
          }
        }
      });
  }
}



 
