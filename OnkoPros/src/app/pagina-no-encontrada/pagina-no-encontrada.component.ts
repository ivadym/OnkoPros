import { Component, OnInit } from '@angular/core';
import { NavegacionService } from '../navegacion.service';

@Component({
  selector: 'app-pagina-no-encontrada',
  templateUrl: './pagina-no-encontrada.component.html',
  styleUrls: ['./pagina-no-encontrada.component.css']
})
export class PaginaNoEncontradaComponent implements OnInit {

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
