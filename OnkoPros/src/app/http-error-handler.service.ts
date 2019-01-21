import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AdvertenciasService } from './advertencias.service';
import { AuthService } from './auth/auth.service';
import { NavegacionService } from './navegacion.service';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor(
    private authService: AuthService,
    private advertenciasService: AdvertenciasService,
    private navegacionService: NavegacionService
  ) { }

  /**
   * Trata las operaciones HTTP fallidas sin parar la ejecucción
   */
  handleError(error: HttpErrorResponse, operacion: string) {
    if(error.status === 400) {
      this.badRequest();
    } else if (error.status === 404) {
      this.notFound();
    } else if(error.status === 403 && operacion != 'login()') {
      this.forbidden();
    }
    const mensaje = (error.error instanceof ErrorEvent) ?
      error.error.message : // Error en la red o en el lado del cliente
      `El servidor ha devuelto el código de error: "${error.status}", 
      con el cuerpo: "${error.error}"`; // Error del backend -> se analiza el body
    // TODO: Mejorar el tratamiento del error para que sea digerido por el usuario
    console.error(`ERROR en la operación ${operacion}: ${mensaje}`);
  };

  /**
   * Trata el error HTTP 400 Bad Request
   */
  badRequest() {
    this.navegacionService.goToPaginaNoEncontrada();
  }

  /**
   * Trata el error HTTP 404 Not Found
   */
  notFound() {
    this.navegacionService.goToPaginaNoEncontrada();
  }

  /**
   * Trata el error HTTP 403 Forbidden
   */
  forbidden() {
    this.advertenciasService.alerta('Su sesión ha caducado. Si lo desea, vuelva a iniciar sesión.')
    this.authService.logout();
  }

}
