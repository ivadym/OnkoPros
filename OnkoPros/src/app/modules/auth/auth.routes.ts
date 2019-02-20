import { Routes } from '@angular/router';

import { AuthComponent } from './components/auth/auth.component';
import { LoginComponent } from './components/login/login.component';

import { LoginGuard } from '../../guards/auth/login.guard';

export const authRoutes: Routes = [
  {
    path: 'login',
    component: AuthComponent,
    canActivate: [LoginGuard],
    children: [
      {
        path: '',
        component: LoginComponent,
      }
    ]
  }
];
