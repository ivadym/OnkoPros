import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { HttpErrorHandlerService, HandleError } from 'src/app/http-error-handler.service';
import { Entrevista } from './entrevista';
import { Item } from './item';
import { Valor } from './valor';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class EntrevistasService {

  private _entrevistasURL = 'http://localhost:8080/api/entrevistas';  // URL de la web api
  private handleError: HandleError;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService
  ) { 
    this.handleError = httpErrorHandler.createHandleError('EntrevistasService');
  }

  /**
   * GET API URL de las entrevistas
   */
  get entrevistasURL(): string {
    // TODO: Petición al servidor (fichero de configuración)
    return this._entrevistasURL;
  }

  /**
   * SET API URL de las entrevistas
   */
  set entrevistasURL(url: string) {
    // TODO: Petición cambio URL API entrevistas (fichero de configuración)
    this._entrevistasURL = url;
  }

  /**
   * Extrae las entrevistas del servidor
   */
  getEntrevistas(): Observable<Entrevista[]> {
    return this.http.get<Entrevista[]>(this.entrevistasURL)
      .pipe(
        catchError(this.handleError<Entrevista[]>('getEntrevistas()'))
      );
  }

  /**
   * Extrae la siguiente pregunta
   * Devuelve 'undefined' cuando no encuentra más preguntas
   */
  getItem(id: number): Observable<Item> {
    const url = `${this.entrevistasURL}/${id}`;
    return this.http.get<Item>(url)
      .pipe(
        map(preguntas => preguntas[0]), // Devuelve un array de {0|1} elementos
        catchError(this.handleError<Item>(`getItem(id=${id})`))
      );
  }

  /**
   * Envío de la respuesta del usuario al servidor
   */
  postValor(entrevistaId: number, valor: Valor): Observable<Valor> {
    // TODO: Establecer timeout
    const url = `${this.entrevistasURL}/${entrevistaId}`;
    return this.http.post<Valor>(url, valor, httpOptions)
    .pipe(
      catchError(this.handleError<Valor>(`postValor id=${valor.id}`, valor))
    )
  }

}
