import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Entrevista } from '../../../../../classes/entrevista';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { NavegacionService } from '../../../../../services/navegacion/navegacion.service';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-entrevistas-instrucciones',
  templateUrl: './entrevistas-instrucciones.component.html',
  styleUrls: ['./entrevistas-instrucciones.component.css']
})
export class EntrevistasInstruccionesComponent implements OnInit {

  entrevista: Entrevista;

  constructor(
    private route: ActivatedRoute,
    private entrevistasService: EntrevistasService,
    private navegacionService: NavegacionService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.extraerEntrevista(+this.route.snapshot.paramMap.get('id'));
  }
  
  /**
   * Extrae la entrevista asociada a un determinado id
   */
  extraerEntrevista(id: number): void {
    this.entrevistasService.getEntrevista(id).subscribe(
      entrevista => {
        if(entrevista) {
          //TODO: Fichero de logs
          console.log('SERVIDOR - Entrevista seleccionada: ' + entrevista.id);
          this.entrevista = entrevista;
        } else {
          console.error(`LOG getEntrevista(${id}) (no existe la entrevista solicitada)`);
          this.navegacionService.goToPaginaNoEncontrada();
        }
      },
      error => {
        this.errorHandler.handleError(error, `getEntrevista(${id})`);
      }
    );
  }

}
