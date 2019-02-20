import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { NotificacionesComponent } from './components/notificaciones/notificaciones.component';
import { EntrevistasComponent } from './components/entrevistas/entrevistas/entrevistas.component';
import { EntrevistasListaComponent } from './components/entrevistas/entrevistas-lista/entrevistas-lista.component';
import { EntrevistasInstruccionesComponent } from './components/entrevistas/entrevistas-instrucciones/entrevistas-instrucciones.component';
import { ItemsComponent } from './components/entrevistas/items/items.component';
import { ItemsFinComponent } from './components/entrevistas/items-fin/items-fin.component';

import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
  declarations: [
    DashboardComponent,
    InicioComponent,
    PerfilComponent,
    NotificacionesComponent,
    EntrevistasComponent,
    EntrevistasListaComponent,
    EntrevistasInstruccionesComponent,
    ItemsComponent,
    ItemsFinComponent
  ],
  imports: [
    NativeScriptCommonModule,
    DashboardRoutingModule
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ]
})
export class DashboardModule { }
