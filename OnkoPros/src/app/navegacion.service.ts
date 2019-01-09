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
   * Redirige al usuario a la lista de entrevistas
   */
  goToEntrevistas(): void {
    this.router.navigate(['/dashboard/entrevistas']);
  }

  /**
   * Redirige al usuario a la página de inicio
   */
  goToInicio(): void {
    this.router.navigate(['']);
  }

}
