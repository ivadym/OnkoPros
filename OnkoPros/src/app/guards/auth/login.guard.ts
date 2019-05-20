import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth/auth.service';
import { NavegacionService } from '../../services/navegacion/navegacion.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private navegacionService: NavegacionService
  ) { }
  
  /**
   * Guard que filtra la navegación a la página del login
   */
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if (this.authService.usuarioLogueado) {
      this.navegacionService.navegar('', false);
      return false;
    } else {
      return true;
    }
  }

}
