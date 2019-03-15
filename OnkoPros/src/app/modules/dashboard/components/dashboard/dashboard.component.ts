import { Component, OnInit } from '@angular/core';

import { Usuario } from '../../../../classes/usuario';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  usuarioLogueado: Usuario;
  
  constructor(
    private authService: AuthService,
  ) {
    this.authService.usuarioLogueadoObservable.subscribe(
      usuario => this.usuarioLogueado = usuario
    );
  }

  ngOnInit() { }

  /**
   * Cierra la sesión actual
   */
  logout(): void {
    this.authService.logout();
  }

}
