import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Pages } from './shared/enums/pages.enum';
import { AccessGuard } from './auth/auth.guard';
import { AuthOnlyGuard } from './auth/authOnly.guard';

export const routes: Routes = [
  // HOME continua eager
  {
    path: Pages.HOME,
    loadComponent: () =>
      import('./core/pages/home/home.component').then(
        (m) => m.HomeComponent,
      ),
  },

  // páginas usando HomeComponent
  {
    path: Pages.ATENDIMENTO,
    loadComponent: () =>
      import('./core/pages/home/home.component').then(
        (m) => m.HomeComponent,
      ),
  },
  {
    path: Pages.ATENDIMENTO_INDIVIDUAL,
    loadComponent: () =>
      import('./core/pages/home/home.component').then(
        (m) => m.HomeComponent,
      ),
  },
  {
    path: Pages.ATENDIMENTO_GRUPO,
    loadComponent: () =>
      import('./core/pages/home/home.component').then(
        (m) => m.HomeComponent,
      ),
  },

  // páginas isoladas
  {
    path: Pages.ANALISE_REICHANA,
    loadComponent: () =>
      import(
        './shared/components/analise-corporal-reichana/analise-corporal-reichana.component'
        ).then((m) => m.AnaliseCorporalReichanaComponent),
  },

  {
    path: Pages.MINDFULLNESS,
    loadComponent: () =>
      import('./shared/components/mindfulness/mindfulness.component').then(
        (m) => m.MindfulnessComponent,
      ),
  },

  {
    path: Pages.SOMATIC_EXPERIENCE,
    loadComponent: () =>
      import(
        './shared/components/somatic-experience/somatic-experience.component'
        ).then((m) => m.SomaticExperienceComponent),
  },

  {
    path: Pages.SUPERVISION,
    loadComponent: () =>
      import('./shared/components/supervision/supervision.component').then(
        (m) => m.SupervisionComponent,
      ),
  },

  {
    path: Pages.ABOUT,
    loadComponent: () =>
      import('./core/pages/about/about.component').then(
        (m) => m.AboutComponent,
      ),
  },

  {
    path: Pages.CONTACT,
    loadComponent: () =>
      import('./core/pages/contact/contact.component').then(
        (m) => m.ContactComponent,
      ),
  },

  {
    path: Pages.BIO,
    loadComponent: () =>
      import('./shared/components/biography/biography.component').then(
        (m) => m.BiographyComponent,
      ),
  },

  {
    path: `${Pages.BIO}/:name`,
    loadComponent: () =>
      import('./shared/components/biography/biography.component').then(
        (m) => m.BiographyComponent,
      ),
  },

  // auth
  {
    path: 'auth',
    loadChildren: () =>
      import('./auth/auth.module').then((m) => m.AuthModule),
  },

  // onboarding
  {
    path: 'onboarding',
    canMatch: [AuthOnlyGuard],
    loadComponent: () =>
      import('./shared/components/onboarding/onboarding.component').then(
        (m) => m.OnboardingComponent,
      ),
  },

  // protected area
  {
    path: '',
    canMatch: [AccessGuard],
    children: [
      {
        path: Pages.DASHBOARD,
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardPageComponent,
          ),

        children: [
          {
            path: 'profile',
            loadComponent: () =>
              import(
                './shared/components/dashboard-profile/dashboard-profile.component'
              ).then((m) => m.DashboardProfileComponent),
          },

          {
            path: 'notifications',
            loadComponent: () =>
              import(
                './shared/components/dashboard-notifications/dashboard-notifications.component'
              ).then((m) => m.DashboardNotificationsComponent),
          },
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

  {
    path: 'error',
    loadComponent: () =>
      import('./core/pages/error/error.component').then(
        (m) => m.ErrorPageComponent,
      ),
  },

  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'disabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
