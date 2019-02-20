import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { CuadroDialogoComponent } from '../../components/cuadro-dialogo/cuadro-dialogo.component';

@Injectable({
  providedIn: 'root'
})
export class CuadroDialogoService {

  constructor(
    private modalService: NgbModal
  ) { }

  /**
   * Muestra un cuadro de diálogo de advertencia y espera la respuesta del usuario
   */
  advertencia(mensaje_1: string, mensaje_2: string): Promise<boolean> {
    const modal = this.modalService.open(
      CuadroDialogoComponent,
      {
        windowClass: 'window-modal',
        backdropClass: 'backdrop-color',
        backdrop: 'static',
        keyboard: false
      }
    );
    modal.componentInstance.mensaje_1 = mensaje_1;
    modal.componentInstance.mensaje_2 = mensaje_2;
    modal.componentInstance.alerta = false;
    return modal.result;
  }

  /**
   * Muestra un cuadro de diálogo de alerta y espera la respuesta del usuario
   */
  alerta(mensaje_1: string, mensaje_2:string): Promise<boolean> {
    const modal = this.modalService.open(
      CuadroDialogoComponent,
      {
        windowClass: 'window-modal',
        backdropClass: 'backdrop-color',
        backdrop: 'static',
        keyboard: false
      }
    );
    modal.componentInstance.mensaje_1 = mensaje_1;
    modal.componentInstance.mensaje_2 = mensaje_2;
    modal.componentInstance.alerta = true;
    return modal.result;
  }

}
