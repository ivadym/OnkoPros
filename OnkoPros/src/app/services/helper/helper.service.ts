import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  /**
   * Actualiza los títulos de los valores (Implementación exclusiva {NativeScript})
   */
  actualizarTituloValores(valores: any): string[] {
    return null;
  }
  
}
