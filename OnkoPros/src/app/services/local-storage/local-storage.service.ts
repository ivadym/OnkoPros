import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  /**
   * Extrae del almacenamiento local el valor asociado a una clave determinada
   */
  getItem(key: string): string | null {
    return localStorage.getItem(key) ? localStorage.getItem(key) : JSON.stringify(null);
  }

  /**
   * Guarda en el almacenamiento local una tupla de clave - valor
   */
  setItem(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * Elimina del almacenamiento local el valor asociado a una clave determinada
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

}
