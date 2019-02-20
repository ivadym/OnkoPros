import { Component, OnInit } from '@angular/core';

import { NavegacionService } from '../../services/navegacion/navegacion.service';

@Component({
  selector: 'app-no-encontrado',
  templateUrl: './no-encontrado.component.html',
  styleUrls: ['./no-encontrado.component.css']
})
export class NoEncontradoComponent implements OnInit {

  constructor(
    private navegacionService: NavegacionService
  ) { }

  ngOnInit() { }

  /**
   * Redirige al usuario a la página de inicio
   */
  goToInicio(): void {
    this.navegacionService.goToInicio();
  }

}
