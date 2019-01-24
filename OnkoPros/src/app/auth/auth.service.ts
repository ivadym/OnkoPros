import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { Usuario } from './usuario';
import { NavegacionService } from '../navegacion.service';

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
  private _usuarioSubject: BehaviorSubject<Usuario>;
  private _currentUser: Observable<Usuario>;

  constructor(
    private http: HttpClient,
    private navegacionService: NavegacionService
  ) {
    this._usuarioSubject = new BehaviorSubject(JSON.parse(localStorage.getItem('usuarioLogueado')));
    this._currentUser = this._usuarioSubject.asObservable();
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
   * GET usuario logueado (observable)
   */
  get usuarioLogueadoObservable(): Observable<Usuario> {
    return this._currentUser;
  }

  /**
   * GET usuario logueado (observable)
   */
  get usuarioLogueado(): Usuario {
    return this._usuarioSubject.value;
  }

  /**
   * SET usuario logueado
   */
  set usuarioLogueado(usuario: Usuario) {
    localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
    this._usuarioSubject.next(usuario);
  }

  /**
   * Envío de las credenciales de usuario al servidor
   */
  postLogin(usuario: string, clave: string): Observable<any> {
    return this.http.post(this._authURL, {usuario, clave}, httpOptions);
  }
  
  /**
   * Cierra la sesión
   */
  logout(): void {
    // TODO: se limpian los flags y después salta el canDeactivate, por lo que
    // al dar a cancelar (al cierre de sesión) y después moverse a otra ruta,
    // el sistema te preguta 2 veces y te echa (si das a aceptar)
    // TODO: Fichero de logs
    localStorage.removeItem('usuarioLogueado');
    this.usuarioLogueado = null;
    this.urlInicial = null;
    this.navegacionService.goToLogin();
  }

  /**
   * Comprueba si el usuario tiene iniciada la sesión y en caso de que no lo haya hecho,
   * lo redirige al formulario del login
   */
  checkLogin(url: string): boolean {
    if (this.usuarioLogueado) {
      return true;
    } else {
      this.urlInicial = url;
      this.navegacionService.goToLogin();
      return false;
    }
  }

  /**
   * Devuelve el token asociado al usuario
   */
  getJWT(): string {
    return this.usuarioLogueado ? this.usuarioLogueado.jwt : null;
  }

}
