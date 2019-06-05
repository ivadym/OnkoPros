import { Injectable } from '@angular/core';
import { Valor } from 'src/app/classes/valor';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }
  
  /**
   * Actualiza los títulos de los valores (Implementación exclusiva {NativeScript})
   */
  actualizarTituloValores(valores: Valor[]): string[] {
    var tituloValores = [];
    for (const key in valores) {
      if (valores[key].VisibleValor) {
        tituloValores.push(valores[key].Titulo + " (" + valores[key].Valor + ")");
      } else {
        tituloValores.push(valores[key].Titulo);
      }
    }
    return tituloValores;
  }

}
