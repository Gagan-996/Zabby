import { Routes } from '@angular/router';

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
        path: 'search',
        loadComponent: () => import('./components/search-business/search-business.component').then(m => m.SearchBusinessComponent)
    },
    {
        path: 'business-details',
        loadComponent: () => import('./components/business-detail/business-detail.component').then(m => m.BusinessDetailComponent)
    }
];
