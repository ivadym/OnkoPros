import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ChartsModule } from 'ng2-charts';

import { DashboardComponent } from './dashboard/dashboard.component';
import { InicioComponent } from './inicio/inicio.component';
import { PerfilComponent } from './perfil/perfil.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { EntrevistasComponent } from './entrevistas/entrevistas/entrevistas.component';
import { EntrevistasListaComponent } from './entrevistas/entrevistas-lista/entrevistas-lista.component';
import { EntrevistasInstruccionesComponent } from './entrevistas/entrevistas-instrucciones/entrevistas-instrucciones.component';
import { EntrevistasFinComponent } from './entrevistas/entrevistas-fin/entrevistas-fin.component';
import { ItemComponent } from './entrevistas/item/item.component';

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
    EntrevistasFinComponent,
    ItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    ChartsModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
