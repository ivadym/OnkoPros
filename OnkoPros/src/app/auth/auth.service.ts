import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { Usuario } from './usuario';
import { NavegacionService } from '../navegacion.service';
import { NgxSpinnerService } from 'ngx-spinner';

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
    private navegacionService: NavegacionService,
    private spinner: NgxSpinnerService
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
   * GET usuario logueado
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
    this.spinner.show();
    return this.http.post(this._authURL, {usuario, clave}, httpOptions)
      .pipe(
        finalize(() => {
          this.spinner.hide();
        })
      );
  }
  
  /**
   * Cierra la sesión
   */
  logout(): void {
    // TODO: Fichero de logs
    localStorage.removeItem('usuarioLogueado');
    this.usuarioLogueado = null;
    this.urlInicial = null;
    this.navegacionService.goToLogin();
  }

  /**
   * Devuelve el token asociado al usuario
   */
  getJWT(): string {
    return this.usuarioLogueado ? this.usuarioLogueado.jwt : null;
  }

}
