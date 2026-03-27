import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { LocationService } from '../../services/location.service';
import { SmartImageDirective } from '../../helper/smart-image.directive';

@Component({
  selector: 'app-business-list',
  imports: [CommonModule, SmartImageDirective],
  templateUrl: './business-list.component.html',
  styleUrl: './business-list.component.css'
})
export class BusinessListComponent implements OnInit {
  openDropdown: 'area' | 'type' | 'open' | 'verified' | null = null;
  categoryTitle = 'Businesses Near You';
  routeSlug = '';
  endingWith = '';
  businesses: any[] = [];
  isLoading = true;
  skeletons = Array.from({ length: 4 });
  areaLabel = 'Near you';
  private readonly isBrowser: boolean;

  constructor(
    private route: ActivatedRoute,
    public api: ApiService,
    private locationService: LocationService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    const navigationState = this.isBrowser ? history.state ?? {} : {};
    console.log('Navigation state:', navigationState);
    const routePath = this.route.snapshot.paramMap.get('nearMePath') ?? '';
    console.log('Route path:', routePath);

    this.routeSlug = navigationState['categorySlug'] || '';
    this.endingWith = navigationState['endingWith'] || '';
    const categoryName = navigationState['categoryName']

    if (!this.routeSlug && routePath) {
      const parsed = this.parseNearMePath(routePath);
      this.routeSlug = parsed.slug;
      this.endingWith = parsed.endingWith;
    }

    this.categoryTitle = `${categoryName} ${this.endingWith} Near Me`;

    if (this.isBrowser && this.routeSlug) {
      this.loadBusinesses();
    }
  }

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

  private parseNearMePath(path: string): { slug: string; endingWith: string } {
    const normalized = path.replace(/-near-me$/, '');
    const parts = normalized.split('-').filter(Boolean);

    if (parts.length <= 1) {
      return {
        slug: normalized,
        endingWith: ''
      };
    }

    return {
      slug: parts.slice(0, -1).join('-'),
      endingWith: parts[parts.length - 1]
    };
  }

  private buildCategoryLabel(slug: string, endingWith: string): string {
    return [slug, endingWith]
      .filter(Boolean)
      .join(' ')
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private loadBusinesses(): void {
    this.isLoading = true;

    this.locationService.getCurrentLocation()
      .then((location) => {
        const lat = location?.lat || 22.7196;
        const lng = location?.lng || 75.8577;

        this.areaLabel = lat && lng ? 'Near you' : 'Indore';
        this.fetchBusinesses(lat, lng);
      })
      .catch(() => {
        this.areaLabel = 'Indore';
        this.fetchBusinesses(22.7196, 75.8577);
      });
  }

  private fetchBusinesses(lat: number, lng: number): void {
    this.api
      .get(`businesses/nearby-by-category?lat=${lat}&lng=${lng}&categorySlug=${this.routeSlug}`)
      .subscribe({
        next: (res: any) => {
          this.businesses = Array.isArray(res?.data) ? res.data : [];
          this.isLoading = false;
        },
        error: () => {
          this.businesses = [];
          this.isLoading = false;
        }
      });
  }
}
