import { Routes } from '@angular/router';

import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { NotificacionesComponent } from './components/notificaciones/notificaciones.component';
import { EntrevistasComponent } from './components/entrevistas/entrevistas/entrevistas.component';
import { EntrevistasListaComponent } from './components/entrevistas/entrevistas-lista/entrevistas-lista.component';
import { EntrevistasInstruccionesComponent } from './components/entrevistas/entrevistas-instrucciones/entrevistas-instrucciones.component';
import { ItemsComponent } from './components/entrevistas/items/items.component';
import { ItemsFinComponent } from './components/entrevistas/items-fin/items-fin.component';
import { ControlComponent } from './components/control/control.component';

import { AuthGuard } from '../../guards/auth/auth.guard';
import { CanDeactivateGuard } from '../../guards/can-deactivate.guard';
import { ProfesionalGuard } from '../../guards/profesional/profesional.guard';

export const dashboardRoutes: Routes = [
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
            path: 'control',
            component: ControlComponent,
            canActivate: [ProfesionalGuard]
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
                component: ItemsComponent,
                canDeactivate: [CanDeactivateGuard]
              },
              {
                path: ':id/fin',
                component: ItemsFinComponent
              },
            ]
          }
        ]
      }
    ]
  }
];
