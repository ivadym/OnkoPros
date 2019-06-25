import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { Usuario } from '../../classes/usuario';

import { LocalStorageService } from '../local-storage/local-storage.service';
import { SpinnerService } from '../spinner/spinner.service';
import { CuadroDialogoService } from '../cuadro-dialogo/cuadro-dialogo.service';
import { NavegacionService } from '../navegacion/navegacion.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    
  private _authURL = environment.production ? 'api/auth' : 'http://172.27.6.220:8081/api/auth';
  
  private _urlInicial: string; // URL de redirección
  private _usuarioSubject: BehaviorSubject<Usuario>;
  private _currentUser: Observable<Usuario>;

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService,
    private router: Router,
    private spinnerService: SpinnerService,
    private cuadroDialogoService: CuadroDialogoService,
    private navegacionService: NavegacionService
  ) {
    this._usuarioSubject = new BehaviorSubject(JSON.parse(this.localStorageService.getItem('usuarioLogueado')));
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
    this.localStorageService.setItem('usuarioLogueado', JSON.stringify(usuario));
    this._usuarioSubject.next(usuario);
  }

  /**
   * Envío de las credenciales de usuario al servidor
   */
  postLogin(usuario: string, clave: string): Observable<any> {
    this.spinnerService.show();
    return this.http.post(this._authURL, {usuario, clave}, httpOptions)
      .pipe(
        finalize(() => {
          this.spinnerService.hide();
        })
      );
  }

  /**
   * Cierra la sesión
   */
  logout(): void {
    var url = this.router.url;
    var regEx = /\/dashboard\/entrevistas\/\d\/items/
    if (regEx.test(url)) {
      this.cuadroDialogoService.advertencia(
        '¿Desea cerrar la sesión actual?',
        'Se perderán los cambios no guardados.'
      ).then(res => {
        if (res) {
          this.limpiarSesion();
        } else {
          return;
        }
      });
    } else {
      this.limpiarSesion();
    }
  }

  /**
   * Limpia las credenciales de la sesión iniciada
   */
  limpiarSesion(): void {
    this.localStorageService.removeItem('usuarioLogueado');
    this.usuarioLogueado = null;
    this.urlInicial = null;
    this.navegacionService.navegar('/login', true);
  }

  /**
   * Devuelve el token asociado al usuario
   */
  getJWT(): string {
    return this.usuarioLogueado ? this.usuarioLogueado.JWT : null;
  }

}
