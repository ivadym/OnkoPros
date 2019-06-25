import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Usuario } from '../../classes/usuario';

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
    modal.componentInstance.perfiles = null;
    modal.componentInstance.alerta = false;
    return modal.result.then(
      res => {
        // Botón aceptar
        return true;
      },
      err => {
        // Botón cancelar
        return false;
      }
    );
  }

  /**
   * Muestra un cuadro de diálogo de alerta y espera la respuesta del usuario
   */
  alerta(mensaje_1: string, mensaje_2:string): Promise<boolean> {
    const modal = this.modalService.open(
      CuadroDialogoComponent,
      {
        centered: true,
        windowClass: 'window-modal',
        backdropClass: 'backdrop-color',
        backdrop: 'static',
        keyboard: false
      }
    );
    modal.componentInstance.mensaje_1 = mensaje_1;
    modal.componentInstance.mensaje_2 = mensaje_2;
    modal.componentInstance.perfiles = null;
    modal.componentInstance.alerta = true;
    return modal.result;
  }

    /**
   * Muestra un cuadro de diálogo para elegir el perfil de la sesión iniciada
   */
  seleccionPerfil(usuario: Usuario): Promise<Usuario> {
    const modal = this.modalService.open(
      CuadroDialogoComponent,
      {
        centered: true,
        windowClass: 'window-modal',
        backdropClass: 'backdrop-color',
        backdrop: 'static',
        keyboard: false
      }
    );
    modal.componentInstance.mensaje_1 = 'Tiene asoaciados distintos perfiles a su cuenta de usuario.';
    modal.componentInstance.mensaje_2 = 'Elija uno para iniciar sesión.';
    modal.componentInstance.perfiles = usuario.Perfil;
    modal.componentInstance.alerta = true;
    return modal.result.then(res => {
      switch(res) {
        case "Administrador": {
          usuario.Perfil = ["Administrador"];
          return usuario;
        } 
        case "Profesional de la salud": {
          usuario.Perfil = ["Profesional de la salud"];
          return usuario;
        } 
        case "Paciente": {
          usuario.Perfil = ["Paciente"];
          return usuario; 
        }
      }
    });
  }

}
