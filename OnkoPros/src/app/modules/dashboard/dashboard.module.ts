import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

// Componentes externos & Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

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
    CommonModule,
    FormsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatTabsModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
