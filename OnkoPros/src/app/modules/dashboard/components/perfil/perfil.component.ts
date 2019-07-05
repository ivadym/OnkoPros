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
    this.authService.usuarioLogueadoObservable.subscribe(
      usuario => this.usuarioLogueado = usuario
    );
  }
  
  ngOnInit() { }

}
