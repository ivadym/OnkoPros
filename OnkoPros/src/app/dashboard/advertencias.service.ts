import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdvertenciasService {

  constructor() { }

  /**
   * Lanza un aviso de confirmación antes de que el usuario abandone la página
   */
  confirm(message?: string): Observable<boolean> {
    const confirmation = window.confirm(message || '¿Desea abandonar la página actual?');
    return of(confirmation);
  };

}
