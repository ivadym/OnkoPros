import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ModalComponent } from './modal/modal.component';

@Injectable({
  providedIn: 'root'
})
export class AvisosService {

  constructor(
    private modalService: NgbModal
  ) { }

  advertencia(mensaje_1: string, mensaje_2: string): Promise<boolean> {
    const modal = this.modalService.open(
      ModalComponent,
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

  alerta(mensaje_1: string, mensaje_2:string): Promise<boolean> {
    const modal = this.modalService.open(
      ModalComponent,
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
