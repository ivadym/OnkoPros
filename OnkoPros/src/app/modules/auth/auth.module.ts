import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material';
import { MatIconModule } from '@angular/material/icon';

import { AuthComponent } from './components/auth/auth.component';
import { LoginComponent } from './components/login/login.component';

import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatIconModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }
