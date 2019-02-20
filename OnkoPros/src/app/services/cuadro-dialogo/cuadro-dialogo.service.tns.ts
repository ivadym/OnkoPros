import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CuadroDialogoService {

  constructor() { }
  
  /**
   * Muestra un cuadro de diálogo de advertencia y espera la respuesta del usuario
   */
  advertencia(mensaje_1: string, mensaje_2: string): Promise<boolean> {
    // TODO
    return;
  }

  /**
   * Muestra un cuadro de diálogo de alerta y espera la respuesta del usuario
   */
  alerta(mensaje_1: string, mensaje_2:string): Promise<boolean> {
    // TODO
    return;
  }

}
