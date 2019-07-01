import { Component, OnInit } from '@angular/core';

import { Usuario } from '../../../../classes/usuario';

import { AuthService } from '../../../../services/auth/auth.service';
import { EntrevistasService } from 'src/app/services/entrevistas/entrevistas.service';
import { CompartirService } from 'src/app/services/compartir/compartir.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  usuarioLogueado: Usuario;
  nEntrevistas: string = "";
  
  constructor(
    private authService: AuthService,
    private entrevistasService: EntrevistasService,
    private compartirService: CompartirService,
    ) {
    this.usuarioLogueado = this.authService.usuarioLogueado;
  }
  
  ngOnInit() { }

  /**
   * Actualización del aviso de notificaciones de las entrevistas
   */
  actualizarBadgeEntrevistas() {
    this.entrevistasService.getEntrevistas().subscribe(
      entrevistas => {
        this.nEntrevistas = entrevistas ? entrevistas.length.toString() : "";
        this.compartirService.emitChange(this.nEntrevistas);
      }
    );
  }
  
  /**
   * Cierra la sesión actual
   */
  logout(): void {
    this.authService.logout();
  }

}
