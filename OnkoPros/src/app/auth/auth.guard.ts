import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { NavegacionService } from '../navegacion.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private navegacionService: NavegacionService
  ) { }

  /**
   *  Guard que controla la navegación entre routes
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    this.authService.urlInicial = state.url;
    if(this.authService.usuarioLogueado) {
      return true;
    } else {
      this.navegacionService.goToLogin();
      return false;
    }
  }
  
  /**
   *  Guard que controla la navegación entre child routes
   */
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }

}
