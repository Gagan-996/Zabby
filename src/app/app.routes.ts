import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
        pathMatch: 'full'
    },
    {
        path:'businesses',
        loadComponent : () => import('./components/business-list/business-list.component').then(m => m.BusinessListComponent)
    },
    {
        path:'business-details',
        loadComponent : () => import('./components/business-detail/business-detail.component').then(m => m.BusinessDetailComponent)
    }
];
