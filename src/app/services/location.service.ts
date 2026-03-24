import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private storageKey = 'cachedLocation';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  getCurrentLocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {

      // ✅ SSR check
      if (!isPlatformBrowser(this.platformId)) {
        console.log('SSR detected - skipping location');
        return resolve({ lat: 0, lng: 0 }); // fallback
      }

      const cacheExpiry = 3 * 60 * 1000;
      const updateThreshold = 1 * 60 * 1000;

      const cachedLocation = localStorage.getItem(this.storageKey);

      if (cachedLocation) {
        const { lat, lng, timestamp } = JSON.parse(cachedLocation);

        if (Date.now() - timestamp < cacheExpiry) {
          resolve({ lat, lng });

          if (Date.now() - timestamp > cacheExpiry - updateThreshold) {
            this.updateLocationInBackground();
          }

          return;
        } else {
          localStorage.removeItem(this.storageKey);
        }
      }

      this.fetchGeolocation()
        .then(resolve)
        .catch(reject);
    });
  }

  private fetchGeolocation(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {

      if (!navigator.geolocation) {
        return reject('Geolocation not supported');
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const location = { lat, lng, timestamp: Date.now() };

          localStorage.setItem(this.storageKey, JSON.stringify(location));

          resolve({ lat, lng });
        },
        (error) => {
          reject(error.message || 'Location error');
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    });
  }

  private updateLocationInBackground(): void {
    this.fetchGeolocation().catch(() => {});
  }
}