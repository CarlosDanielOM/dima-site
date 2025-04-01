import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { StreamerWrapperComponent } from './streamer-wrapper/streamer-wrapper.component';
import { DashboardComponent } from './streamer-wrapper/dashboard/dashboard.component';

export const routes: Routes = [
    { path: '', title: 'DomDimaBot', children: [
        { path: '', component: LandingPageComponent, title: 'DomDimaBot' },
        { path: ':streamer', component: LandingPageComponent, title: 'DomDimaBot' },
    ] },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: ':streamer', title: 'DomDimaBot', children: [
        { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
        { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },

    ]},
    { path: '**', redirectTo: '' }
];
