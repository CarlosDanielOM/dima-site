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
import { ChatEventsComponent } from './modules/chat-events/chat-events.component';
import { CommandsComponent } from './streamer-wrapper/commands/commands.component';
import { TriggersComponent } from './modules/triggers/triggers.component';
import { RedemptionsComponent } from './modules/redemptions/redemptions.component';
import { LogoutComponent } from './logout/logout.component';
import { PermissionGuard } from './guards/permission.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'logout', component: LogoutComponent, title: 'Logout' },
    { path: '', title: 'DomDimaBot', children: [
        { path: '', component: LandingPageComponent, title: 'DomDimaBot' },
        { path: ':streamer', component: LandingPageComponent, title: 'DomDimaBot' },
    ] },
    { path: ':streamer', component: MainComponent, title: 'DomDimaBot', children: [
        {
            path: 'dashboard',
            component: WipComponent,
            title: 'Dashboard',
            data: {
                wip: {
                    progress: 66,
                    accent: 'sky',
                        status: {
                            en: 'Core dashboard widgets are in place — Creating the analytics functions.',
                            es: 'Los widgets principales del panel están listos: creando las funciones de análisis.'
                        },
                        copy: {
                            statusChip: {
                                en: 'Dashboard update in progress',
                                es: 'Actualizando el panel de control'
                            },
                            description: {
                                en: 'We are expanding the analytics layer so you can spot opportunities in real-time.',
                                es: 'Estamos ampliando la capa de analíticas para que puedas detectar oportunidades en tiempo real.'
                            },
                            progressDescription: {
                                en: 'Charts are rendering live metrics. Next up: alerting and notification settings.',
                                es: 'Los gráficos están mostrando métricas en vivo. Lo siguiente: alertas y configuración de notificaciones.'
                            }
                        },
                        highlights: [
                            {
                                icon: '📊',
                                translations: {
                                    en: 'Live KPIs with configurable time ranges.',
                                    es: 'KPIs en vivo con rangos de tiempo configurables.'
                                }
                            },
                            {
                                icon: '🔔',
                                translations: {
                                    en: 'Custom alerts for sudden spikes or drops.',
                                    es: 'Alertas personalizadas para subidas o bajadas repentinas.'
                                }
                            }
                        ]
                }
            }
        },
        { 
            path: 'commands', 
            component: CommandsComponent, 
            title: 'Commands',
            canActivate: [PermissionGuard],
            data: { permission: { requiredLevel: 'everyone' } }
        },
        { 
            path: 'modules', 
            component: ModulesComponent, 
            title: 'Modules',
            canActivate: [PermissionGuard],
            data: { permission: { requiredLevel: 'everyone' } },
            children: [
                { 
                    path: '', 
                    component: ModuleViewComponent, 
                    title: 'Module',
                    canActivate: [PermissionGuard],
                    data: { permission: { requiredLevel: 'everyone' } }
                },
                { 
                    path: 'clips', 
                    component: ClipsComponent, 
                    title: 'Clips',
                    canActivate: [PermissionGuard],
                    data: { permission: { requiredLevel: 'everyone' } }
                },
                { 
                    path: 'chat-events', 
                    component: ChatEventsComponent, 
                    title: 'Chat Events',
                    canActivate: [PermissionGuard],
                    data: { permission: { requiredLevel: 'everyone' } }
                },
                { 
                    path: 'redemptions', 
                    component: RedemptionsComponent, 
                    title: 'Redemptions',
                    canActivate: [PermissionGuard],
                    data: { permission: { requiredLevel: 'everyone' } }
                },
            {
                path: 'triggers',
                component: WipComponent,
                title: 'Triggers',
                canActivate: [PermissionGuard],
                data: {
                    permission: { requiredLevel: 'none', redirectTo: 'dashboard' },
                    wip: {
                        progress: 50,
                        accent: 'amber',
                        status: {
                            en: 'Event wiring underway. Expect a beta soon.',
                            es: 'Conexión de eventos en progreso. Espera una beta pronto.'
                        }
                    }
                }
            },
            {
                path: ':module',
                component: WipComponent,
                title: 'To be implemented',
                canActivate: [PermissionGuard],
                data: {
                    permission: { requiredLevel: 'everyone' },
                    wip: {
                        progress: 100,
                        accent: 'emerald',
                        status: {
                            en: 'Exploring new module capabilities. Share your ideas!',
                            es: 'Explorando nuevas capacidades del módulo. ¡Comparte tus ideas!'
                        },
                        copy: {
                            headline: {
                                en: 'This module is going live with the next drop',
                                es: 'Este módulo llegará con la próxima versión'
                            },
                            description: {
                                en: 'We are wrapping QA and preparing rollout instructions for creators.',
                                es: 'Estamos terminando la QA y preparando instrucciones de despliegue para los creadores.'
                            }
                        },
                        highlights: [
                            {
                                icon: '✅',
                                translations: {
                                    en: 'Feature set locked. Final polish underway.',
                                    es: 'Conjunto de funciones confirmado. Últimos retoques en curso.'
                                }
                            }
                        ]
                    }
                }
            },
        ]},
        {
            path: 'settings',
            component: WipComponent,
            title: 'Settings',
            canActivate: [PermissionGuard],
            data: {
                permission: { requiredLevel: 'premium', redirectTo: 'dashboard' },
                wip: {
                    progress: 0,
                        accent: 'rose',
                    status: {
                        en: 'Planning phase. Want early access? Let us know.',
                            es: 'Fase de planificación. ¿Quieres acceso anticipado? Avísanos.'
                        },
                        copy: {
                            statusChip: {
                                en: 'Kick-off stage',
                                es: 'Etapa inicial'
                            },
                            description: {
                                en: 'We are blueprinting the customization controls to keep things intuitive.',
                                es: 'Estamos definiendo los controles de personalización para mantener todo intuitivo.'
                            },
                            progressDescription: {
                                en: 'Research and UX flows are the current focus before moving into development.',
                                es: 'La investigación y los flujos UX son el enfoque actual antes de pasar al desarrollo.'
                            }
                        },
                        highlights: [
                            {
                                icon: '🧭',
                                translations: {
                                    en: 'Navigation revamp to surface relevant controls faster.',
                                    es: 'Rediseño de navegación para mostrar controles relevantes más rápido.'
                                }
                            },
                            {
                                icon: '🧪',
                                translations: {
                                    en: 'User testing scheduled with our creator cohort.',
                                    es: 'Pruebas de usuario programadas con nuestro grupo de creadores.'
                                }
                            }
                        ]
                }
            }
        },
        {
            path: 'profile/settings',
            component: WipComponent,
            title: 'Settings',
            canActivate: [PermissionGuard],
            data: {
                permission: { requiredLevel: 'premium_plus', redirectTo: 'dashboard' },
                wip: {
                        progress: 0,
                        accent: 'rose',
                    status: {
                        en: 'Profile customization prototype is brewing.',
                            es: 'El prototipo de personalización de perfiles está en camino.'
                        },
                        copy: {
                            statusChip: {
                                en: 'Concept validation',
                                es: 'Validación de concepto'
                            },
                            progressTitle: {
                                en: 'Prototype status',
                                es: 'Estado del prototipo'
                            },
                            progressDescription: {
                                en: 'We are mapping identity controls with granular permission options.',
                                es: 'Estamos mapeando los controles de identidad con opciones de permisos granulares.'
                            }
                        },
                        highlights: [
                            {
                                icon: '🧩',
                                translations: {
                                    en: 'Flexible profile modules ready for testing.',
                                    es: 'Módulos de perfil flexibles listos para pruebas.'
                                }
                            },
                            {
                                icon: '🛡️',
                                translations: {
                                    en: 'Security review scheduled with the platform team.',
                                    es: 'Revisión de seguridad programada con el equipo de plataforma.'
                                }
                            }
                        ]
                }
            }
        },
    ]},
    { path: '**', redirectTo: '' }
];
