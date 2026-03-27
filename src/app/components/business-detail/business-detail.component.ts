import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { BusinessDetail, BusinessDetailResponse, WorkingHour } from '../../models/business-detail.model';
import { SmartImageDirective } from '../../helper/smart-image.directive';

@Component({
  selector: 'app-business-detail',
  imports: [CommonModule, SmartImageDirective],
  templateUrl: './business-detail.component.html',
  styleUrl: './business-detail.component.css'
})
export class BusinessDetailComponent implements OnInit, OnDestroy {
  isLoading = true;
  businessDetail: BusinessDetail | null = null;
  businessSlug = '';
  imageBaseUrl = '';
  private readonly destroy$ = new Subject<void>();

  relatedBusinesses = [
    { name: 'Hidayah Mobile and accessories', imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=900&auto=format&fit=crop' },
    { name: 'Hidayah Mobile and accessories', imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=900&auto=format&fit=crop' },
    { name: 'Hidayah Mobile and accessories', imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=900&auto=format&fit=crop' }
  ];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService
  ) {
    this.imageBaseUrl = this.api.imageUrl;
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const slug = params.get('slug') ?? '';

        if (!slug) {
          this.businessSlug = '';
          this.businessDetail = null;
          this.isLoading = false;
          return;
        }

        this.businessSlug = slug;
        this.loadBusinessDetail(slug);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get categoryNames(): string[] {
    return this.businessDetail?.categories?.map((category) => category.name).filter(Boolean) ?? [];
  }

  get productNames(): string[] {
    const offerings = this.businessDetail?.categories?.flatMap((category) => category.offerings ?? []) ?? [];
    const names = offerings.map((offering) => offering.name).filter(Boolean);
    return Array.from(new Set(names));
  }

  get displayWorkingHours(): Array<{ day: string; timing: string; closed: boolean }> {
    return (this.businessDetail?.working_hours ?? []).map((hour) => ({
      day: this.formatDay(hour.day),
      timing: this.formatTiming(hour),
      closed: hour.is_closed === 1
    }));
  }

  get galleryImages(): string[] {
    const galleryPaths = (this.businessDetail?.images ?? []).filter(Boolean);

    if (galleryPaths.length) {
      return galleryPaths;
    }

    return this.businessDetail?.profile_image_path ? [this.businessDetail.profile_image_path] : [];
  }

  get hasGalleryImages(): boolean {
    return this.galleryImages.length > 0;
  }

  get primaryCategoryLabel(): string {
    return this.categoryNames.join(', ') || 'Business';
  }

  get isOpen(): boolean {
    return this.businessDetail?.is_open ?? false;
  }

  get mapDirectionsUrl(): string {
    const lat = this.businessDetail?.location?.lat;
    const lng = this.businessDetail?.location?.lng;

    return lat != null && lng != null
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : 'https://www.google.com/maps';
  }

  get callLink(): string {
    const phone = this.businessDetail?.business_phone_number ?? '';
    return `tel:${phone.replace(/\s+/g, '')}`;
  }

  resolveImageUrl(path: string | null | undefined): string {
    return `${this.imageBaseUrl}${path ?? ''}`;
  }

  trackByValue(_: number, value: string): string {
    return value;
  }

  private loadBusinessDetail(slug: string): void {
    this.isLoading = true;
    const cacheKey = `business-detail-${slug}`;

    this.api
      .get<BusinessDetailResponse>(`businesses/slug/${slug}`, cacheKey)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.businessDetail = res?.data ?? null;
          this.isLoading = false;
        },
        error: () => {
          this.businessDetail = null;
          this.isLoading = false;
        }
      });
  }

  private formatDay(day: string): string {
    return day
      .split('-')
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  private formatTiming(hour: WorkingHour): string {
    if (hour.is_closed === 1) {
      return 'Closed';
    }

    return `${this.formatTime(hour.open_time)} - ${this.formatTime(hour.close_time)}`;
  }

  private formatTime(value: string): string {
    const [hourString = '0', minuteString = '0'] = value.split(':');
    const hours = Number(hourString);
    const minutes = Number(minuteString);
    const period = hours >= 12 ? 'PM' : 'AM';
    const normalizedHour = hours % 12 || 12;
    const normalizedMinute = minutes.toString().padStart(2, '0');

    return `${normalizedHour}:${normalizedMinute} ${period}`;
  }
}
