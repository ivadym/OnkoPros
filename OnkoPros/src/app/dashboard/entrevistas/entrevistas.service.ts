import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Entrevista } from './entrevista';
import { Item } from './item';
import { Valor } from './valor';

import { NgxSpinnerService } from 'ngx-spinner';

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

  constructor(
    private http: HttpClient,
    private spinner: NgxSpinnerService
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
    this.spinner.show();
    return this.http.get<Entrevista[]>(this.entrevistasURL)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      );
  }

  /**
   * Extrae la siguiente pregunta
   */
  getItem(id: number): Observable<Item> {
    this.spinner.show();
    const url = `${this.entrevistasURL}/${id}`;
    return this.http.get<Item>(url)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      );
  }

  /**
   * Envío de la respuesta del usuario al servidor
   */
  postValor(entrevistaId: number, valor: Valor): Observable<any> {
    this.spinner.show();
    const url = `${this.entrevistasURL}/${entrevistaId}`;
    return this.http.post<any>(url, valor, httpOptions)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      );
  }

}
