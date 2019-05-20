import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { Entrevista } from '../../../../../classes/entrevista';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { NavegacionService } from '../../../../../services/navegacion/navegacion.service';
import { SpinnerService } from '../../../../../services/spinner/spinner.service';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-entrevistas-instrucciones',
  templateUrl: './entrevistas-instrucciones.component.html',
  styleUrls: ['./entrevistas-instrucciones.component.css']
})
export class EntrevistasInstruccionesComponent implements OnInit {

  spinner: boolean = false;
  private _spinnerSubscription: Subscription;

  entrevista: Entrevista;

  constructor(
    private route: ActivatedRoute,
    private entrevistasService: EntrevistasService,
    private navegacionService: NavegacionService,
    private spinnerService: SpinnerService,
    private errorHandler: HttpErrorHandlerService
  ) {
    this._spinnerSubscription = this.spinnerService.estadoSpinnerObservable.subscribe(
      estado => this.spinner = estado
    );
  }

  ngOnInit() {
    this.extraerEntrevista(+this.route.snapshot.paramMap.get('id'));
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
        if (entrevista && entrevista.InstruccionPrincipal) {
          //TODO: Fichero de logs
          console.log('SERVIDOR - Entrevista seleccionada: ' + entrevista.IdEntrevista);
          this.entrevista = entrevista;
        } else if (entrevista) {
            this.navegacionService.navegar('/dashboard/entrevistas/' + entrevista.IdEntrevista + '/items', false);
        } else {
          console.log(`LOG getEntrevista(${id}) (no existe la entrevista solicitada)`);
          this.navegacionService.navegar('/404', false);
        }
      },
      error => {
        this.errorHandler.handleError(error, `getEntrevista(${id})`);
      }
    );
  }

}
