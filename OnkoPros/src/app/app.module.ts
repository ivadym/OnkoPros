import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { CuadroDialogoComponent } from './components/cuadro-dialogo/cuadro-dialogo.component';
import { NoEncontradoComponent } from './components/no-encontrado/no-encontrado.component';

import { FlexLayoutModule } from '@angular/flex-layout';
import { NgxSpinnerModule } from 'ngx-spinner';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
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
    FlexLayoutModule,
    NgxSpinnerModule,
    NoopAnimationsModule,
    AuthModule,
    DashboardModule,
    LoggerModule.forRoot({ // NgxLoggerLevels: TRACE|DEBUG|INFO|LOG|WARN|ERROR|FATAL|OFF
      level: environment.production ? NgxLoggerLevel.OFF : NgxLoggerLevel.LOG,
      disableConsoleLogging: false,
      serverLogLevel: NgxLoggerLevel.OFF, // Se envían mensajes del nivel especificado o más alto al servidor
      serverLoggingUrl: '/api/logs'
    }),
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
