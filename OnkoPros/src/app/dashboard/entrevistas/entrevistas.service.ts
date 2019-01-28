import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

  private _entrevistasURL = 'api/entrevistas';  // URL de la web api

  constructor(
    private http: HttpClient,
  ) { }

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
    return this.http.get<Entrevista[]>(this.entrevistasURL);
  }

  /**
   * Extrae la siguiente pregunta
   */
  getItem(id: number): Observable<Item> {
    const url = `${this.entrevistasURL}/${id}`;
    return this.http.get<Item>(url);
  }

  /**
   * Envío de la respuesta del usuario al servidor
   */
  postValor(entrevistaId: number, valor: Valor): Observable<Valor> {
    // TODO: Establecer timeout
    const url = `${this.entrevistasURL}/${entrevistaId}`;
    return this.http.post<Valor>(url, valor, httpOptions);
  }

}
