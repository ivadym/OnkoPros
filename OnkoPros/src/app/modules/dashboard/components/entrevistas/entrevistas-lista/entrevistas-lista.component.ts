import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Entrevista } from '../../../../../classes/entrevista';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';

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

}
