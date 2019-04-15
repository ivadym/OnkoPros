import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../services/auth/auth.service';
 
@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) { }
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>  {
    const authToken = this.authService.getJWT();
    const idUsuario = this.authService.usuarioLogueado ? this.authService.usuarioLogueado.IdUsuario.toString() : '';
    const idPerfil = this.authService.usuarioLogueado ? this.authService.usuarioLogueado.Perfil.toString() : '';
    const authReq = req.clone({ // Clonado de la petición y añadido el header de autenticación
      setHeaders: {
        id: idUsuario,
        perfil: idPerfil,
        Authorization: `Bearer ${authToken}`
      },
    });
    return next.handle(authReq); // Envío de la petición clonada al siguiente handler
  }

}
