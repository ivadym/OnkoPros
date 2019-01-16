import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {
  
  usuarioLogueado: string;

  constructor(
    private authService : AuthService
  ) { }

  ngOnInit() {
   // TODO
   // this.usuarioLogueado = this.authService.usuarioLogueado;
  }

}
