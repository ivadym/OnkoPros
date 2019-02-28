import { Injectable } from '@angular/core';
import * as applicationSettings from "tns-core-modules/application-settings";

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {


  /**
   * Extrae del almacenamiento local el valor asociado a una clave determinada
   */
  getItem(key: string): string | null {
    return applicationSettings.getString(key) ? applicationSettings.getString(key) : JSON.stringify(null);
  }

  /**
   * Guarda en el almacenamiento local una tupla de clave - valor
   */
  setItem(key: string, value: string): void {
    applicationSettings.setString(key, value);
  }

  /**
   * Elimina del almacenamiento local el valor asociado a una clave determinada
   */
  removeItem(key: string): void {
    applicationSettings.remove(key);
  }

}
