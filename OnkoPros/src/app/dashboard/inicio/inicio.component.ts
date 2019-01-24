import { Component, OnInit } from '@angular/core';

import { Usuario } from 'src/app/auth/usuario';

import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  
  usuarioLogueado: Usuario;

  constructor(
    private authService : AuthService
  ) {
    this.usuarioLogueado = this.authService.usuarioLogueado;
  }

  ngOnInit() { }
  
}
