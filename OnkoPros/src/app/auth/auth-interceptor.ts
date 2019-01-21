import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
 
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor( ) { }
 
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = localStorage.getItem('jwt');
    const authReq = req.clone({ // Clonado de la petición y añadido el header de autenticación
      setHeaders: { Authorization: `Bearer ${authToken}` }
    });
    return next.handle(authReq); // Envío de la petición clonada al siguiente handler
  }

}
