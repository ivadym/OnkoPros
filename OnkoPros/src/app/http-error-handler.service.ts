import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

/**
 * Tipo de la función handleError devuelta por HttpHandler.createHandleError
 */
export type HandleError =
  <T> (operation?: string, result?: T) => (error: HttpErrorResponse) => Observable<T>;

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor() { }
    /**
     * Crea la función handleError(servicio)
     */
    createHandleError = (serviceName = '') => <T>
    (operation = 'operation', result = {} as T) => this.handleError(serviceName, operation, result);

  /**
   * Devuelve la función que trata las operaciones HTTP fallidas sin parar la ejecución
   * @param serviceName - Nombre del servicio que intentó la operación
   * @param operation - Nombre de la operación fallida
   * @param result - Valor opcional a devolver (observable)
   */
  handleError<T> (serviceName = '', operation = 'operation', result = {} as T) {

    return (error: HttpErrorResponse): Observable<T> => {
      // TODO: Fichero REMOTO de logs (eliminar mensajes en la consola)
      const message = (error.error instanceof ErrorEvent) ?
        error.error.message : // Error en la red o en el lado del cliente
      `El servidor ha devuelto el código de error: ${error.status},
        con el cuerpo: "${error.error}"`; // Error del backend -> se analiza el body

      // TODO: Mejorar el tratamiento del error para que sea digerido por el usuario
      console.error(`${serviceName}: ${operation} ha fallado: ${message}`);
      
      return of(result); // La aplicación sigue funcionando (el valor devuelto no para la ejecución)
    };
  }

}
