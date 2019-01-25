import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard/dashboard.component';
import { InicioComponent } from './inicio/inicio.component';
import { PerfilComponent } from './perfil/perfil.component';
import { EntrevistasComponent } from './entrevistas/entrevistas/entrevistas.component';
import { EntrevistasListaComponent } from './entrevistas/entrevistas-lista/entrevistas-lista.component';
import { ItemComponent } from './entrevistas/item/item.component';

import { DashboardRoutingModule } from './dashboard-routing.module';

@NgModule({
  declarations: [
    DashboardComponent,
    InicioComponent,
    PerfilComponent,
    EntrevistasComponent,
    EntrevistasListaComponent,
    ItemComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
