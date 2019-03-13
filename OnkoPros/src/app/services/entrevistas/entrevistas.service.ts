import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Entrevista } from '../../classes/entrevista';
import { Item } from '../../classes/item';
import { Valor } from '../../classes/valor';

import { SpinnerService } from '../spinner/spinner.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class EntrevistasService {

  private _entrevistasURL = 'api/entrevistas';  // URL de la web api (NGINX)
  // private _entrevistasURL = 'http://172.27.6.220:8081/api/entrevistas'; // URL de la web api (nodejs)

  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerService
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
    this.spinnerService.show();
    return this.http.get<Entrevista[]>(this.entrevistasURL)
      .pipe(
        finalize(() => {
          this.spinnerService.hide();
        })
      );
  }

  /**
   * Extrae del servidor la entrevista asociada al ID: id
   */
  getEntrevista(id: number): Observable<Entrevista> {
    this.spinnerService.show();
    return this.http.get<Entrevista>(`${this.entrevistasURL}/${id}`)
      .pipe(
        finalize(() => {
          this.spinnerService.hide();
        })
      );
  }

  /**
   * Extrae la siguiente pregunta
   */
  getItem(id: number): Observable<Item> {
    this.spinnerService.show();
    const url = `${this.entrevistasURL}/${id}/items`;
    return this.http.get<Item>(url)
      .pipe(
        finalize(() => {
          this.spinnerService.hide();
        })
      );
  }

  /**
   * Envío de la respuesta del usuario al servidor
   */
  postValor(id_entrevista: number, valor: Valor): Observable<any> {
    this.spinnerService.show();
    const url = `${this.entrevistasURL}/${id_entrevista}/items`;
    return this.http.post<any>(url, valor, httpOptions)
      .pipe(
        finalize(() => {
          this.spinnerService.hide();
        })
      );
  }

}
