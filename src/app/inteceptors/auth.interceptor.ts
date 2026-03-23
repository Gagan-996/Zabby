import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const platformId = inject(PLATFORM_ID);

    let token = '';

    if (isPlatformBrowser(platformId)) {
        token = localStorage.getItem('token') || '';
    }

    const modifiedReq = req.clone({
        setHeaders: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });

    return next(modifiedReq);
};