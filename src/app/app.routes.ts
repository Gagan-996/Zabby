import { Routes, UrlMatchResult, UrlSegment } from '@angular/router';

const nearMeMatcher = (segments: UrlSegment[]): UrlMatchResult | null => {
    if (segments.length !== 1) {
        return null;
    }

    const path = segments[0].path;
    if (!path.endsWith('-near-me') || path === 'near-me') {
        return null;
    }

    return {
        consumed: segments,
        posParams: {
            nearMePath: segments[0]
        }
    };
};

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
        pathMatch: 'full'
    },
    {
        path: 'businesses',
        loadComponent: () => import('./components/business-list/business-list.component').then(m => m.BusinessListComponent)
    },
    {
        matcher: nearMeMatcher,
        loadComponent: () => import('./components/business-list/business-list.component').then(m => m.BusinessListComponent)
    },
    {
        path: 'search',
        loadComponent: () => import('./components/search-business/search-business.component').then(m => m.SearchBusinessComponent)
    },
    {
        path: 'business-details',
        loadComponent: () => import('./components/business-detail/business-detail.component').then(m => m.BusinessDetailComponent)
    },
    {
        path: '**',
        loadComponent: () => import('./components/not-found/not-found.component').then(m => m.NotFoundComponent)
    }
];
