import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Usuario } from 'src/app/auth/usuario';

import { AuthService } from 'src/app/auth/auth.service';
import { AdvertenciasService } from 'src/app/advertencias.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  usuarioLogueado: Usuario;

  constructor(
    private router: Router,
    private authService: AuthService,
    private advertenciasService: AdvertenciasService
  ) {
    this.authService.usuarioLogueadoObservable.subscribe(
      usuario => this.usuarioLogueado = usuario
    );
  }

  ngOnInit() { }

  /**
   * Cierra la sesión actual
   */
  logout() {
    var url = this.router.url;
    var regEx = /\/dashboard\/entrevistas\/\d/
    if (regEx.test(url)) {
      this.advertenciasService.advertencia(
        `¿Desea cerrar la sesión actual? Se perderán los cambios no guardados.`
      ).subscribe(res => {
        if(res) {
          this.authService.logout();
        } else {
          return;
        }
      });
    } else {
      this.authService.logout();
    }
  }

}
