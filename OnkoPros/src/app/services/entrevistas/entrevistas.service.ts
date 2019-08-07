import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { Entrevista } from '../../classes/entrevista';
import { Item } from '../../classes/item';

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
  
  private _entrevistasURL = environment.production ? 'api/entrevistas' : 'https://172.27.6.220:8080/api/entrevistas';
  
  constructor(
    private http: HttpClient,
    private spinnerService: SpinnerService
  ) { }
  
  /**
   * GET API URL de las entrevistas
   */
  get entrevistasURL(): string {
    return this._entrevistasURL;
  }

  /**
   * SET API URL de las entrevistas
   */
  set entrevistasURL(url: string) {
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
  getSiguienteItem(idEntrevista: number): Observable<any> {
    this.spinnerService.show();
    const url = `${this.entrevistasURL}/${idEntrevista}/items`;
    return this.http.get<any>(url)
      .pipe(
        finalize(() => {
          this.spinnerService.hide();
        })
      );
  }

  /**
   * Extrae una pregunta determinada
   */
  getItemRespondido(idEntrevista: number, idItem: number): Observable<any> {
    this.spinnerService.show();
    const url = `${this.entrevistasURL}/${idEntrevista}/items/${idItem}`;
    return this.http.get<any>(url)
      .pipe(
        finalize(() => {
          this.spinnerService.hide();
        })
      );
  }

  /**
   * Envío de la respuesta del usuario al servidor
   */
  postItem(item: Item): Observable<any> {
    this.spinnerService.show();
    const url = `${this.entrevistasURL}/${item.IdEntrevista}/items`;
    return this.http.post<any>(url, item, httpOptions)
      .pipe(
        finalize(() => {
          this.spinnerService.hide();
        })
      );
  }

  /**
   * Actualización de la respuesta del usuario
   */
  postActualizarItem(item: Item): Observable<any> {
    this.spinnerService.show();
    const url = `${this.entrevistasURL}/${item.IdEntrevista}/items/${item.IdItem}`;
    return this.http.post<any>(url, item, httpOptions)
      .pipe(
        finalize(() => {
          this.spinnerService.hide();
        })
      );
  }

}
