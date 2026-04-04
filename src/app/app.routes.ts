import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BiographyComponent } from './shared/components/biography/biography.component';
import { AboutComponent } from './core/pages/about/about.component';
import { Pages } from './shared/enums/pages.enum';
import { MindfulnessComponent } from './shared/components/mindfulness/mindfulness.component';
import { AnaliseCorporalReichanaComponent } from './shared/components/analise-corporal-reichana/analise-corporal-reichana.component';
import { AccessGuard } from './auth/auth.guard';
import { AuthOnlyGuard } from './auth/authOnly.guard';
import { DashboardProfileComponent } from './shared/components/dashboard-profile/dashboard-profile.component';
import { DashboardScheduleComponent } from './shared/components/dashboard-schedule/dashboard-schedule.component';
import { DashboardNotificationsComponent } from './shared/components/dashboard-notifications/dashboard-notifications.component';
import { SomaticExperienceComponent } from './shared/components/somatic-experience/somatic-experience.component';
import { SupervisionComponent } from './shared/components/supervision/supervision.component';
import { HomeComponent } from './core/pages/home/home.component';
import { ContactComponent } from './core/pages/contact/contact.component';

export const routes: Routes = [
  { path: Pages.HOME, component: HomeComponent },
  { path: Pages.ATENDIMENTO, component: HomeComponent },
  { path: Pages.ATENDIMENTO_INDIVIDUAL, component: HomeComponent },
  { path: Pages.ATENDIMENTO_GRUPO, component: HomeComponent },
  { path: Pages.ANALISE_REICHANA, component: AnaliseCorporalReichanaComponent },
  { path: Pages.MINDFULLNESS, component: MindfulnessComponent },
  { path: Pages.SOMATIC_EXPERIENCE, component: SomaticExperienceComponent },
  { path: Pages.SUPERVISION, component: SupervisionComponent },
  { path: Pages.ABOUT, component: AboutComponent },
  { path: Pages.CONTACT, component: ContactComponent },

  { path: Pages.BIO, component: BiographyComponent },
  { path: `${Pages.BIO}/:name`, component: BiographyComponent },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'onboarding',
    canMatch: [AuthOnlyGuard],
    loadComponent: () =>
      import('./shared/components/onboarding/onboarding.component').then(
        (m) => m.OnboardingComponent,
      ),
  },
  {
    path: '',
    canMatch: [AccessGuard],
    children: [
      {
        path: Pages.DASHBOARD,
        loadComponent: () =>
          import('./shared/components/user-dashboard/user-dashboard.component').then(
            (m) => m.UserDashboardComponent,
          ),
        children: [
          {
            path: '',
            redirectTo: 'profile',
            pathMatch: 'full',
            data: { title: 'Profile', subtitle: 'Manage your profile' },
          },
          {
            path: 'profile',
            component: DashboardProfileComponent,
            data: { title: 'Profile', subtitle: 'Manage your profile' },
          },
          {
            path: 'schedule',
            component: DashboardScheduleComponent,
            data: { title: 'Schedule', subtitle: 'Manage availability' },
          },
          {
            path: 'notifications',
            component: DashboardNotificationsComponent,
            data: { title: 'Notifications', subtitle: 'Your notifications' },
          },
          // { path: 'mensagens', component: MensagensComponent },
        ],
      },
      {
        path: Pages.SCHEDULING,
        loadComponent: () =>
          import('./core/pages/scheduling/scheduling.component').then(
            (m) => m.SchedulingComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      // anchorScrolling: 'enabled', // Enables anchor scroll
      // scrollOffset: [0, 80], // Optional: offset for fixed header
      scrollPositionRestoration: 'enabled', // 'enabled' or 'top'
      anchorScrolling: 'disabled',
    }),
  ], // Configure the routes
  exports: [RouterModule], // Export RouterModule so it can be used in AppModule
})
export class AppRoutingModule { }
