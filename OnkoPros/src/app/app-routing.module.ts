import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NoEncontradoComponent } from './components/no-encontrado/no-encontrado.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: NoEncontradoComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      {
        enableTracing: true, // TODO: Eliminar -> solo para DEBUG
      }
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
