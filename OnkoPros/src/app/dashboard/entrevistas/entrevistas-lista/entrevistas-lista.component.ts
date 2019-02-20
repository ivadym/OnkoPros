import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Entrevista } from '../entrevista';

import { EntrevistasService } from '../entrevistas.service';
import { HttpErrorHandlerService } from 'src/app/http-error-handler.service';
import { NavegacionService } from 'src/app/navegacion.service';

@Component({
  selector: 'app-entrevistas-lista',
  templateUrl: './entrevistas-lista.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./entrevistas-lista.component.css']
})
export class EntrevistasListaComponent implements OnInit {

  entrevistas: Entrevista[];
  entrevistasDisponibles: boolean = true;

  constructor(
    private entrevistasService: EntrevistasService,
    private navegacionService: NavegacionService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.extraerEntrevistas();
  }

  /**
   * Lista las entrevistas extraídas del servidor
   */
  extraerEntrevistas(): void {
    this.entrevistasService.getEntrevistas().subscribe(
      entrevistas => {
        if(entrevistas) {
        //TODO: Fichero de logs
        console.log('SERVIDOR - Entrevistas: ' + entrevistas.length);
        this.entrevistas = entrevistas
        this.entrevistasDisponibles = true;
        } else {
          console.error("LOG getEntrevistas() (no hay más entrevistas disponibles)");
          this.entrevistasDisponibles = false;
        }
      },
      error => {
        this.errorHandler.handleError(error, 'getEntrevistas()');
      }
    );
  }

  /**
   * Redirige al usuario a la página de inicio
   */
  goToInicio(): void {
    this.navegacionService.goToInicio();
  }

}
