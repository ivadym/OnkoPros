import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouteReuseStrategy } from '@angular/router';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptFormsModule } from "nativescript-angular/forms";


import { AuthComponent } from './components/auth/auth.component';
import { LoginComponent } from './components/login/login.component';

import { AuthRoutingModule } from './auth-routing.module';

import { CustomRouteReuseStrategy } from './custom-router-strategy.tns';


@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent
  ],
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    ReactiveFormsModule,
    AuthRoutingModule
  ],
  providers: [
    {
      provide: RouteReuseStrategy,
      useClass: CustomRouteReuseStrategy
    }
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class AuthModule { }
