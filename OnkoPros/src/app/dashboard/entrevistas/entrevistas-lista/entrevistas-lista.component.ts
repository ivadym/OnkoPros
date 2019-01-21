import { Component, OnInit } from '@angular/core';

import { Entrevista } from '../entrevista';

import { EntrevistasService } from '../entrevistas.service';
import { HttpErrorHandlerService } from 'src/app/http-error-handler.service';

@Component({
  selector: 'app-entrevistas-lista',
  templateUrl: './entrevistas-lista.component.html',
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
    this.getEntrevistas();
  }

  /**
   * Lista las entrevistas enviadas por el servidor
   */
  getEntrevistas(): void {
    this.entrevistasService.getEntrevistas().subscribe(
      entrevistas => {
        if(entrevistas) {
        //TODO: Fichero de logs
        console.log('SERVIDOR - Entrevistas: ' + entrevistas);
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
