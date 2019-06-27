import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class NavegacionService {

  constructor(
    private router: Router,
    private location: Location
  ) { }

  /**
   * Redirige al usuario a la URL especificada
   */
  navegar(url: string, borrarHistorial: boolean): void {
    this.router.navigate([url], { replaceUrl: borrarHistorial });
  }

  /**
   * Redirige al usuario a la página anterior
   */
  retroceder(): void {
    this.location.back();
  }

}
