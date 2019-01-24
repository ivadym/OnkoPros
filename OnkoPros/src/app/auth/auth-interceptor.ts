import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

import { AuthService } from './auth.service';
 
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) { }
 
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = this.authService.usuarioLogueado ? this.authService.usuarioLogueado.jwt : null;
    const authReq = req.clone({ // Clonado de la petición y añadido el header de autenticación
      setHeaders: { Authorization: `Bearer ${authToken}` }
    });
    return next.handle(authReq); // Envío de la petición clonada al siguiente handler
  }

}
