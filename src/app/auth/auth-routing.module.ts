import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthComponent } from './auth.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { CallbackComponent } from './callback/callback.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
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
      {
        path: 'forgot-password',
        canMatch: [GuestOnlyGuard],
        component: ForgotPasswordComponent,
      },
      {
        path: 'reset-password',
        canMatch: [GuestOnlyGuard],
        component: ResetPasswordComponent,
      },
      {
        path: 'confirm-email',
        canMatch: [GuestOnlyGuard],
        component: ConfirmEmailComponent,
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
