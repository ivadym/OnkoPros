import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { CuadroDialogoComponent } from './components/cuadro-dialogo/cuadro-dialogo.component';
import { NoEncontradoComponent } from './components/no-encontrado/no-encontrado.component';

import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';

import { httpInterceptorProviders } from './interceptors/http-interceptor-providers';

@NgModule({
  declarations: [
    AppComponent,
    CuadroDialogoComponent,
    NoEncontradoComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxSpinnerModule,
    AuthModule,
    DashboardModule,
    AppRoutingModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [
    AppComponent    
  ],
  entryComponents: [
    CuadroDialogoComponent // Permite que el cuadro de diálogo sea un componente
  ]
})
export class AppModule { }
