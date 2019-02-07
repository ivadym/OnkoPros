import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ModalComponent } from './modal/modal.component';
import { PaginaNoEncontradaComponent } from './pagina-no-encontrada/pagina-no-encontrada.component';

import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { NgxSpinnerModule } from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';

import { httpInterceptorProviders } from './http-interceptor-providers';

@NgModule({
  declarations: [
    AppComponent,
    ModalComponent,
    PaginaNoEncontradaComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AuthModule,
    DashboardModule,
    NgxSpinnerModule,
    AppRoutingModule
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [
    AppComponent    
  ],
  entryComponents: [
    ModalComponent    
  ]
})
export class AppModule { }
