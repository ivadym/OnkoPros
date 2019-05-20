import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth/auth.service';
import { NavegacionService } from '../../services/navegacion/navegacion.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private authService: AuthService,
    private navegacionService: NavegacionService
  ) { }

  /**
   * Guard que comprueba si el usuario se encuentra logueado
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    this.authService.urlInicial = state.url;
    if (this.authService.usuarioLogueado) {
      return true;
    } else {
      this.navegacionService.navegar('/login', false);
      return false;
    }
  }
  
  /**
   * Guard que comprueba si el usuario se encuentra logueado (child routes)
   */
  canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canActivate(next, state);
  }
  
}
