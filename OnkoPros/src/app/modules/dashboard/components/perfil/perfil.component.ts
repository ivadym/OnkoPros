import { Component, OnInit } from '@angular/core';

import { Usuario } from '../../../../classes/usuario';

import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {

  usuarioLogueado: Usuario;

  constructor(
    private authService: AuthService
  ) {
    this.usuarioLogueado = this.authService.usuarioLogueado;
  }

  ngOnInit() { }

}
