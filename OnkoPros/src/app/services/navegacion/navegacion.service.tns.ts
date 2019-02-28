import { Injectable } from '@angular/core';
import { RouterExtensions } from "nativescript-angular/router";

@Injectable({
  providedIn: 'root'
})
export class NavegacionService {

  constructor(
    private routerExtensions: RouterExtensions
  ) { }
  
  /**
   * Redirige al usuario a la URL especificada
   */
  navegar(url: string, borrarHistorial: boolean): void {
    this.routerExtensions.navigate([url], { clearHistory: borrarHistorial });
  }

}
