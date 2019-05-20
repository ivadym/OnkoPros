import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';

import { Entrevista } from '../../../../../classes/entrevista';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { SpinnerService } from '../../../../../services/spinner/spinner.service';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-entrevistas-lista',
  templateUrl: './entrevistas-lista.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./entrevistas-lista.component.css']
})
export class EntrevistasListaComponent implements OnInit {

  spinner: boolean = false;
  private _spinnerSubscription: Subscription;

  entrevistas: Entrevista[];
  entrevistasDisponibles: boolean = true;

  constructor(
    private entrevistasService: EntrevistasService,
    private spinnerService: SpinnerService,
    private errorHandler: HttpErrorHandlerService
  ) {
    this._spinnerSubscription = this.spinnerService.estadoSpinnerObservable.subscribe(
      estado => this.spinner = estado
    );
  }

  ngOnInit() {
    this.extraerEntrevistas();
  }
  
  ngOnDestroy() {
    this._spinnerSubscription.unsubscribe();
  }

  /**
   * Lista las entrevistas extraídas del servidor
   */
  extraerEntrevistas(): void {
    this.entrevistasService.getEntrevistas().subscribe(
      entrevistas => {
        if (entrevistas) {
        //TODO: Fichero de logs
        console.log('SERVIDOR - Entrevistas: ' + entrevistas.length);
        this.entrevistas = entrevistas;
        this.entrevistasDisponibles = true;
        } else {
          console.log("LOG getEntrevistas() (no hay más entrevistas disponibles)");
          this.entrevistasDisponibles = false;
        }
      },
      error => {
        this.errorHandler.handleError(error, 'getEntrevistas()');
      }
    );
  }

}
