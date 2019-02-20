import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { AuthService } from '../auth/auth.service';
import { CuadroDialogoService } from '../cuadro-dialogo/cuadro-dialogo.service';
import { NavegacionService } from '../navegacion/navegacion.service';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {


  constructor(
    private authService: AuthService,
    private cuadroDialogoService: CuadroDialogoService,
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
    } else if(error.status === 0 || error.status === 500) {
      this.serverError();
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
    this.cuadroDialogoService.alerta(
      'Su sesión ha caducado.',
      'Si lo desea, puede volver a iniciar sesión.'
    );
    this.authService.logout();
  }

  /**
   * Trata el error HTTP 500 - Internal Server Error
   */
  serverError() {
    this.cuadroDialogoService.alerta(
      'Se ha producido un error en el servidor',
      'Vuelva a intentar la operación más adelante.'
    )
  }
  
}
