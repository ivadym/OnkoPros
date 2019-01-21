import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavegacionService {

  constructor(
    private router: Router
  ) { }

  /**
   * Redirige al usuario a la página de inicio
   */
  goToInicio(): void {
    this.router.navigate(['']);
  }

  /**
   * Redirige al usuario a la página de inicio de sesión
   */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Redirige al usuario a la lista de entrevistas
   */
  goToEntrevistas(): void {
    this.router.navigate(['/dashboard/entrevistas']);
  }

  /**
   * Redirige al usuario a la página no encontrada
   */
  goToPaginaNoEncontrada(): void {
    this.router.navigate(['RecursoNoEncontrado']);
  }
}
