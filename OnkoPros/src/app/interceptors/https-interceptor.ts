import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class HttpsInterceptor implements HttpInterceptor {

  constructor( ) { }
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    var secureReq = req;
    if (environment.production) {
      secureReq = req.clone({
        url: req.url.replace('http://', 'https://') // Clonado de la petición y reemplazo de 'http://' por 'https://'
      }); 
    } else { // Entorno de desarrollo
      secureReq = req.clone({
        url: req.url.replace('https://', 'http://') // Clonado de la petición y reemplazo de 'https://' por 'http://'
      });
    }

    return next.handle(secureReq); // Envío de la petición SEGURA al siguiente handler
  }

}
