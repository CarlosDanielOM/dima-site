import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { LoginComponent } from './login/login.component';
import { StreamerWrapperComponent } from './streamer-wrapper/streamer-wrapper.component';
import { DashboardComponent } from './streamer-wrapper/dashboard/dashboard.component';
import { MainComponent } from './main/main.component';
import { WipComponent } from './wip/wip.component';
import { ModulesComponent } from './modules/modules.component';
import { ModuleViewComponent } from './modules/module-view/module-view.component';
import { ClipsComponent } from './modules/clips/clips.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: '', title: 'DomDimaBot', children: [
        { path: '', component: LandingPageComponent, title: 'DomDimaBot' },
        { path: ':streamer', component: LandingPageComponent, title: 'DomDimaBot' },
    ] },
    { path: ':streamer', component: MainComponent, title: 'DomDimaBot', children: [
        { path: 'dashboard', component: DashboardComponent, title: 'Dashboard' },
        { path: 'modules', component: ModulesComponent, title: 'Modules', children: [
            { path: '', component: ModuleViewComponent, title: 'Module' },
            { path: 'clips', component: ClipsComponent, title: 'Clips' },
            { path: ':module', component: WipComponent, title: 'To be implemented' },
        ]},
        { path: 'settings', component: WipComponent, title: 'Settings' },
        { path: 'profile/settings', component: WipComponent, title: 'Settings' },
    ]},
    { path: '**', redirectTo: '' }
];
