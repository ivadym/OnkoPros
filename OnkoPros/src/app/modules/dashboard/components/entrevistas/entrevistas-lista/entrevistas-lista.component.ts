import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { Entrevista } from '../../../../../classes/entrevista';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { SpinnerService } from '../../../../../services/spinner/spinner.service';
import { LoggerService } from '../../../../../services/logger/logger.service';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-entrevistas-lista',
  templateUrl: './entrevistas-lista.component.html',
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
    private logger: LoggerService,
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
        this.logger.log(`Lista de entrevistas extraída (núm. entrevistas: ${entrevistas.length})`);
        this.entrevistas = entrevistas;
        this.entrevistasDisponibles = true;
        } else {
          this.logger.log('No quedan entrevistas pendientes/disponibles');
          this.entrevistasDisponibles = false;
        }
      },
      error => {
        this.errorHandler.handleError(error, 'getEntrevistas()');
      }
    );
  }

}
