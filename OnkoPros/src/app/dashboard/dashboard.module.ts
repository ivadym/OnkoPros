import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { DashboardComponent } from './dashboard/dashboard.component';
import { InicioComponent } from './inicio/inicio.component';
import { PerfilComponent } from './perfil/perfil.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { EntrevistasComponent } from './entrevistas/entrevistas/entrevistas.component';
import { EntrevistasListaComponent } from './entrevistas/entrevistas-lista/entrevistas-lista.component';
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
    ItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
