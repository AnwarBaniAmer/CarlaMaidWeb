import { Routes } from '@angular/router';
export const routes: Routes = [

    {
        path: '',
        loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent)
    },
    {
        path: 'our-services',
        loadComponent: () => import('./our-services/our-services.component').then(m => m.OurServicesComponent)
    },
    {
        path: 'services/:slug',
        loadComponent: () => import('./service-detail/service-detail.component').then(m => m.ServiceDetailComponent)
    },
    {
        path: 'blogs',
        loadComponent: () => import('./blogs/blogs.component').then(m => m.BlogsComponent)
    },
    {
        path: 'about-us',
        loadComponent: () => import('./about-us/about-us.component').then(m => m.AboutUSComponent)
    },
    {
        path: 'blogs-open',
        loadComponent: () => import('./blogs-open/blogs-open.component').then(m => m.BlogsOpenComponent)
    },
    {
        path: 'book-now',
        loadComponent: () => import('./book-now/book-now.component').then(m => m.BookNowComponent)
    },
    {
        path: 'book-now/success',
        loadComponent: () => import('./book-now/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent)
    },
    {
        path: 'payment/success',
        loadComponent: () => import('./book-now/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent)
    },
    {
        path: 'booking/success',
        loadComponent: () => import('./book-now/payment-success/payment-success.component').then(m => m.PaymentSuccessComponent)
    },
    {
        path: 'book-now/cancel',
        loadComponent: () => import('./book-now/payment-cancel/payment-cancel.component').then(m => m.PaymentCancelComponent)
    },
    {
        path: 'payment/cancel',
        loadComponent: () => import('./book-now/payment-cancel/payment-cancel.component').then(m => m.PaymentCancelComponent)
    },
    {
        path: 'booking/cancel',
        loadComponent: () => import('./book-now/payment-cancel/payment-cancel.component').then(m => m.PaymentCancelComponent)
    },
    {
        path: 'contact-us',
        loadComponent: () => import('./contact-us/contact-us.component').then(m => m.ContactUsComponent)
    },
    {
        path: 'blogs-list',
        loadComponent: () => import('./blogs-list/blogs-list.component').then(m => m.BlogsListComponent)
    },
    {
        path: 'view-blogs/:id',
        loadComponent: () => import('./view-blogs/view-blogs.component').then(m => m.ViewBlogsComponent)
    },
    {
        path: 'thank-you',
        loadComponent: () => import('./thank-you/thank-you.component').then(m => m.ThankYouComponent)
    }
];
export default routes;
