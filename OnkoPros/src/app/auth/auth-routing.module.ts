import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './login/login.component';

import { LoginGuard } from './login.guard';

const routes: Routes = [
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

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AuthRoutingModule { }
