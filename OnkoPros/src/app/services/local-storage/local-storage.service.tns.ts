import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {


  /**
   * Extrae del almacenamiento local el valor asociado a una clave determinada
   */
  getItem(key: string): string | null {
    // TODO
    return JSON.stringify("test");
  }

  /**
   * Guarda en el almacenamiento local una tupla de clave - valor
   */
  setItem(key: string, value: string): void {
    // TODO
    return;
  }

  /**
   * Elimina del almacenamiento local el valor asociado a una clave determinada
   */
  removeItem(key: string): void {
    // TODO
    return;
  }

}
