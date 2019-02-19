import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { InicioComponent } from './inicio/inicio.component';
import { PerfilComponent } from './perfil/perfil.component';
import { NotificacionesComponent } from './notificaciones/notificaciones.component';
import { EntrevistasComponent } from './entrevistas/entrevistas/entrevistas.component';
import { EntrevistasInstruccionesComponent } from './entrevistas/entrevistas-instrucciones/entrevistas-instrucciones.component';
import { EntrevistasListaComponent } from './entrevistas/entrevistas-lista/entrevistas-lista.component';
import { EntrevistasFinComponent } from './entrevistas/entrevistas-fin/entrevistas-fin.component';
import { ItemComponent } from './entrevistas/item/item.component';

import { AuthGuard } from '../auth/auth.guard';
import { CanDeactivateGuard } from '../auth/can-deactivate.guard';

const dashboardRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        canActivateChild: [AuthGuard],
        children: [
          {
            path: '',
            component: InicioComponent
          },
          {
            path: 'perfil',
            component: PerfilComponent
          },
          {
            path: 'notificaciones',
            component: NotificacionesComponent
          },
          {
            path: 'entrevistas',
            component: EntrevistasComponent,
            children: [
              {
                path: '',
                component: EntrevistasListaComponent
              },
              {
                path: ':id',
                component: EntrevistasInstruccionesComponent
              },
              {
                path: ':id/items',
                component: ItemComponent,
                canDeactivate: [CanDeactivateGuard]
              },
              {
                path: ':id/fin',
                component: EntrevistasFinComponent
              },
            ]
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(dashboardRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class DashboardRoutingModule { }
