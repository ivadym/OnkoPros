import { NgModule } from '@angular/core';
import { NativeScriptRouterModule } from 'nativescript-angular/router';

import { authRoutes } from './auth.routes';

@NgModule({
  imports: [
    NativeScriptRouterModule.forChild(authRoutes)
  ],
  exports: [
    NativeScriptRouterModule
  ]
})
export class AuthRoutingModule { }
