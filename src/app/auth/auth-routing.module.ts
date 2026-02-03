import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CallbackComponent } from './callback/callback.component';
import { GuestOnlyGuard } from './guest-only.guard';

const routes: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      { path: 'signin', canMatch: [GuestOnlyGuard], component: LoginComponent },
      {
        path: 'signup',
        canMatch: [GuestOnlyGuard],
        component: RegisterComponent,
      },
      { path: 'callback', component: CallbackComponent },
      { path: '', redirectTo: 'signin', pathMatch: 'full' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
