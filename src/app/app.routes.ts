import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { StreamerWrapperComponent } from './streamer-wrapper/streamer-wrapper.component';
import { DashboardComponent } from './streamer-wrapper/dashboard/dashboard.component';
import { MainComponent } from './main/main.component';
import { WipComponent } from './wip/wip.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: '', title: 'DomDimaBot', children: [
        { path: '', component: LandingPageComponent, title: 'DomDimaBot' },
        { path: ':streamer', component: LandingPageComponent, title: 'DomDimaBot' },
    ] },
    { path: ':streamer', component: MainComponent, title: 'DomDimaBot', children: [
        { path: 'dashboard', component: WipComponent, title: 'Dashboard' },
        { path: 'modules', component: WipComponent, title: 'Modules' },
        { path: 'settings', component: WipComponent, title: 'Settings' },
        { path: 'profile/settings', component: WipComponent, title: 'Settings' },
    ]},
    { path: '**', redirectTo: '' }
];
