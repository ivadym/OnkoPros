import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/auth/auth.service';
import { AdvertenciasService } from 'src/app/advertencias.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private advertenciasService: AdvertenciasService
  ) { }

  ngOnInit() { }

  /**
   * Cierra la sesión actual
   */
  logout() {
    this.advertenciasService.advertencia(
      `¿Desea cerrar la sesión actual? Se perderán los cambios no guardados.`
    ).subscribe(res => {
      if(res) {
        this.authService.logout();
      } else {
        return;
      }
    })
  }

}
