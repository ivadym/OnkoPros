import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
 
@Injectable()
export class HttpsInterceptor implements HttpInterceptor {

  constructor( ) { }
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const secureReq = req.clone({
        url: req.url.replace('http://', 'https://') // Clonado de la petición y reemplazo de 'http://' por 'https://'
    });
    return next.handle(secureReq); // Envío de la petición SEGURA al siguiente handler
  }

}
