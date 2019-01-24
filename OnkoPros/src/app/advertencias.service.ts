import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdvertenciasService {

  constructor() { }

  /**
   * Lanza un aviso de confirmación al usuario
   */
  advertencia(mensaje?: string): Observable<boolean> {
    const confirmacion = window.confirm(mensaje || '¿Desea realizar la operación actual?');
    return of(confirmacion).pipe(take(1));
  };

  /**
   * Lanza una alerta al usuario
   */
  alerta(mensaje?: string): Observable<any> {
    const alerta = window.alert(mensaje || 'Ha ocurrido un error.');
    return of(alerta).pipe(take(1));
  };

}
