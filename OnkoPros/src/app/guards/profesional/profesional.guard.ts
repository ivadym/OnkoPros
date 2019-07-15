import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth/auth.service';
import { NavegacionService } from '../../services/navegacion/navegacion.service';

@Injectable({
  providedIn: 'root'
})
export class ProfesionalGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private navegacionService: NavegacionService
  ) { }
  
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    if(this.authService.usuarioLogueado.Perfil[0] === 'Profesional de la salud') {
      return true;
    } else {
      this.navegacionService.navegar('/dashboard', false);
    }
  }
  
}
