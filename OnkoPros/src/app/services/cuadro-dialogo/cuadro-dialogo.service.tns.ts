import { Injectable } from '@angular/core';
import { confirm, alert, action } from "tns-core-modules/ui/dialogs";

import { Usuario } from '../../classes/usuario';

@Injectable({
  providedIn: 'root'
})
export class CuadroDialogoService {

  constructor() { }
  
  /**
   * Muestra un cuadro de diálogo de advertencia y espera la respuesta del usuario
   */
  advertencia(mensaje_1: string, mensaje_2: string): Promise<boolean> {
    return confirm({
      title: mensaje_1,
      message: mensaje_2,
      okButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      cancelable: false // Solo Android
    });
  }
  
  /**
   * Muestra un cuadro de diálogo de alerta
   */
  alerta(mensaje_1: string, mensaje_2:string): Promise<void> {
    return alert({
      title: mensaje_1,
      message: mensaje_2,
      okButtonText: "Aceptar",
      cancelable: false // Solo Android
    });
  }

  /**
   * Muestra un cuadro de diálogo para elegir el perfil de la sesión iniciada
   */
  seleccionPerfil(usuario): Promise<Usuario> {
    return action({
      message: "Elija el perfil con el que desee iniciar sesión",
      cancelButtonText: "Cancelar",
      actions: usuario.Perfil,
      cancelable: false // Solo Android
    }).then(
      res => {
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
      }
    );
  }

}
