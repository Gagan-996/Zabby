import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Renderer2,
  SimpleChanges,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: 'img[appSmartImage]',
  standalone: true
})
export class SmartImageDirective implements OnInit, OnChanges {
  @Input() appSmartImage: string | null = null;
  @Input() fallback: string | null = 'assets/fallback.png';

  private readonly isBrowser: boolean;
  private hasFallbackApplied = false;

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    const img = this.el.nativeElement;

    if (!img.getAttribute('loading')) {
      this.renderer.setAttribute(img, 'loading', 'lazy');
    }

    if (!img.getAttribute('decoding')) {
      this.renderer.setAttribute(img, 'decoding', 'async');
    }

    this.applySource();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appSmartImage'] && !changes['appSmartImage'].firstChange) {
      this.applySource();
    }
  }

  @HostListener('load')
  onLoad(): void {
    this.setState('loaded');
    this.revealImage();
  }

  @HostListener('error')
  onError(): void {
    if (!this.hasFallbackApplied && this.fallback) {
      this.hasFallbackApplied = true;
      this.setState('loading');
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.fallback);
      return;
    }

    this.setState('error');
    this.revealImage();
  }

  private applySource(): void {
    const src = this.appSmartImage?.trim();

    if (!src) {
      this.setState('error');
      return;
    }

    this.hasFallbackApplied = false;

    if (!this.isBrowser) {
      this.renderer.setAttribute(this.el.nativeElement, 'src', src);
      this.setState('loaded');
      return;
    }

    this.prepareImage();
    this.setState('loading');
    this.renderer.setAttribute(this.el.nativeElement, 'src', src);

    const img = this.el.nativeElement;
    if (img.complete && img.naturalWidth > 0) {
      this.onLoad();
    }
  }

  private prepareImage(): void {
    const img = this.el.nativeElement;
    this.renderer.setStyle(img, 'opacity', '0');
    this.renderer.setStyle(img, 'filter', 'blur(12px)');
    this.renderer.setStyle(img, 'transform', 'scale(1.03)');
    this.renderer.setStyle(
      img,
      'transition',
      'opacity 320ms ease, filter 450ms ease, transform 450ms ease'
    );
    this.renderer.setStyle(img, 'willChange', 'opacity, filter, transform');
  }

  private revealImage(): void {
    const img = this.el.nativeElement;
    this.renderer.setStyle(img, 'opacity', '1');
    this.renderer.setStyle(img, 'filter', 'blur(0)');
    this.renderer.setStyle(img, 'transform', 'scale(1)');
  }

  private setState(state: 'loading' | 'loaded' | 'error'): void {
    const img = this.el.nativeElement;
    const parent = img.parentElement;

    ['smart-image-loading', 'smart-image-loaded', 'smart-image-error'].forEach((className) => {
      this.renderer.removeClass(img, className);
      if (parent) {
        this.renderer.removeClass(parent, className);
      }
    });

    const nextClass = `smart-image-${state}`;
    this.renderer.addClass(img, nextClass);
    if (parent) {
      this.renderer.addClass(parent, nextClass);
    }
  }
}
