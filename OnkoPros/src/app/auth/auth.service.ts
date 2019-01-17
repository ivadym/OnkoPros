import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpErrorHandlerService, HandleError } from '../http-error-handler.service';
import { Usuario } from './usuario';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _authURL = 'http://localhost:8080/api/auth'; // URL de la web api
  private _urlInicial: string; // URL de redirección
  private _usuarioLogueado: Usuario;
  private handleError: HandleError;

  constructor(
    private router: Router,
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandlerService
  ) { 
    this.handleError = httpErrorHandler.createHandleError('AuthService');
  }

  /**
   * GET API URL de autenticación
   */
  get authURL(): string {
    // TODO: Petición al servidor (fichero de configuración)
    return this._authURL;
  }

  /**
   * SET API URL de autenticación
   */
  set authURL(url: string) {
    // TODO: Petición cambio URL API autenticación (fichero de configuración)
    this._authURL = url;
  }

  /**
   * GET URL de redirección
   */
  get urlInicial(): string {
    return this._urlInicial;
  }

  /**
   * SET URL de redirección
   */
  set urlInicial(url: string) {
    this._urlInicial = url;
  }

  /**
   * GET URL de redirección
   */
  get usuarioLoguado(): Usuario {
    return this._usuarioLogueado;
  }

  /**
   * SET URL de redirección
   */
  set usuarioLogueado(usuario: Usuario) {
    this._usuarioLogueado = usuario;
  }

  /**
   * Envío de las credenciales de usuario al servidor
   */
  postLogin(usuario: string, clave: string): Observable<Usuario> {
    return this.http.post<Usuario>(this._authURL, {usuario, clave}, httpOptions)
    .pipe(
      catchError(this.handleError<Usuario>(`postLogin(usuario=${usuario})`))
    )
  }
  
  /**
   * Cierra la sesión
   */
  logout(): void {
    // TODO: se limpian los flags y después salta el canDeactivate, por lo que
    // al dar a cancelar (al cierre de sesión) y después moverse a otra ruta,
    // el sistema te preguta 2 veces y te echa (si das a aceptar).
    localStorage.removeItem('jwt')
    this.urlInicial = null;
    this.router.navigate(['/login']);
  }

  /**
   * Comprueba si el usuario tiene iniciada la sesión y en caso de que no lo haya hecho,
   * lo redirige al formulario del login
   */
  checkLogin(url: string): boolean {
    if (localStorage.getItem('jwt')) {
      return true;
    } else {
      this.urlInicial = url;
      this.router.navigate(['/login']);
      return false;
    }
  }

}
