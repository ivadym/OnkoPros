import { Component, OnInit, Input } from '@angular/core';

import { Usuario } from '../../../../classes/usuario';

import { AuthService } from '../../../../services/auth/auth.service';
import { CompartirService } from 'src/app/services/compartir/compartir.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  usuarioLogueado: Usuario;
  nEntrevistas: string = "";

  constructor(
    private authService : AuthService,
    private compartirService: CompartirService
  ) {
    this.usuarioLogueado = this.authService.usuarioLogueado;
  }

  ngOnInit() {
    this.compartirService.changeEmitted$.subscribe(data => {
      this.nEntrevistas = data;
    });
  }

}
