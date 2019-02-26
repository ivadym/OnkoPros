import { Injectable } from '@angular/core';
import { confirm, alert } from "tns-core-modules/ui/dialogs";

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
      cancelButtonText: "Cancelar"
    });
  }
  
  /**
   * Muestra un cuadro de diálogo de alerta
   */
  alerta(mensaje_1: string, mensaje_2:string): Promise<void> {
    return alert({
      title: mensaje_1,
      message: mensaje_2,
      okButtonText: "Aceptar"
    });
  }

}
