import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Entrevista } from '../../../../../classes/entrevista';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { NavegacionService } from '../../../../../services/navegacion/navegacion.service';
import { SpinnerService } from '../../../../../services/spinner/spinner.service';
import { LoggerService } from '../../../../../services/logger/logger.service';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-entrevistas-instrucciones',
  templateUrl: './entrevistas-instrucciones.component.html',
  styleUrls: ['./entrevistas-instrucciones.component.css']
})
export class EntrevistasInstruccionesComponent implements OnInit {

  @ViewChild("buttonRef") buttonRef;

  spinner: boolean = false;
  private _spinnerSubscription: Subscription;

  entrevista: Entrevista;
  
  constructor(
    private route: ActivatedRoute,
    private entrevistasService: EntrevistasService,
    private navegacionService: NavegacionService,
    private spinnerService: SpinnerService,
    private logger: LoggerService,
    private errorHandler: HttpErrorHandlerService
  ) {
    this._spinnerSubscription = this.spinnerService.estadoSpinnerObservable.subscribe(
      estado => this.spinner = estado
    );
  }
  
  ngOnInit() {
    this.extraerEntrevista(+this.route.snapshot.paramMap.get('id'));
  }
  
  ngAfterViewInit() {
    this.buttonRef ? this.buttonRef.focus() : null;
  }
  
  ngOnDestroy() {
    this._spinnerSubscription.unsubscribe();
  }
  
  /**
   * Extrae la entrevista asociada a un determinado id
   */
  extraerEntrevista(id: number): void {
    this.entrevistasService.getEntrevista(id).subscribe(
      entrevista => {
        this.logger.log(`Entrevista extraída correctamente (id: ${entrevista.IdEntrevista})`);
        if (entrevista.InstruccionPrincipal) {
          this.entrevista = entrevista;
        } else { // Entrevista sin instrucciones: se redirige al usuario directamente a la pregunta
          this.navegacionService.navegar('/dashboard/entrevistas/' + entrevista.IdEntrevista + '/items', false);
        }
      },
      error => {
        this.errorHandler.handleError(error, `extraerEntrevistaEntrevista(id: ${id})`);
      }
    );
  }
  
  /**
   * Redirige al usuario a la página anterior
   */
  retroceder() {
    this.navegacionService.retroceder();
  }

}
