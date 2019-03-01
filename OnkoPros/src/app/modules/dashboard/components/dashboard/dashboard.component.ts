import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Usuario } from '../../../../classes/usuario';
import { AuthService } from '../../../../services/auth/auth.service';
import { CuadroDialogoService } from '../../../../services/cuadro-dialogo/cuadro-dialogo.service';

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
    private cuadroDialogoService: CuadroDialogoService
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
    var regEx = /\/dashboard\/entrevistas\/\d\/items/
    if (regEx.test(url)) {
      this.cuadroDialogoService.advertencia(
        '¿Desea cerrar la sesión actual?',
        'Se perderán los cambios no guardados.'
      ).then(
        res => {
          if(res) {
            this.authService.logout();
          } else {
            return;
          }
        }
      );
    } else {
      this.authService.logout();
    }
  }

}
