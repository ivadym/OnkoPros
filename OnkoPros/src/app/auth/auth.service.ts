import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _usuarioLogueado: string;
  loggedIn = false;
  redirectURL: string;

  constructor(
    private router: Router
  ) { }

  /**
   * GET usuario logueado
   */
  get usuarioLogueado(): string {
    return this._usuarioLogueado;
  }

  /**
   * SET usuario logueado
   */
  set usuarioLogueado(usuario: string) {
    this._usuarioLogueado = usuario;
  }

  /**
   * Inicia la sesión comprobando las credenciales
   */
  login(): Observable<boolean> {

    // TODO: Petición HTTP para verificar usuario

    return of(true).pipe(
      delay(1000),
      tap(val => this.loggedIn = true)
    );
  }

  /**
   * Cierra la sesión
   */
  logout(): void {

    // TODO: Limpiar todos los tokens, etc.
    // TODO: se limpian los flags y después salta el canDeactivate, por lo que
    // al dar a cancelar (al cierre de sesión) y después moverse a otra ruta,
    // el sistema te preguta 2 veces y te echa (si das a aceptar).
    
    this.loggedIn = false;
    this.redirectURL = null;
    this.router.navigate(['/login']);
  }

  /**
   * Comprueba si el usuario tiene iniciada la sesión y en caso de que no lo haya hecho,
   * lo redirige al formulario del login
   */
  checkLogin(url: string): boolean {
    if (this.loggedIn) {
      return true;
    }
    this.redirectURL = url;
    this.router.navigate(['/login']);
    return false;
  }

}
