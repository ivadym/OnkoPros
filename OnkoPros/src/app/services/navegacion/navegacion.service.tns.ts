import { Injectable } from '@angular/core';
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page";

@Injectable({
  providedIn: 'root'
})
export class NavegacionService {

  constructor(
    private routerExtensions: RouterExtensions,
  ) { }
  
  /**
   * Redirige al usuario a la URL especificada
   */
  navegar(url: string, borrarHistorial: boolean): void {
    this.routerExtensions.navigate([url], { clearHistory: borrarHistorial });
  }

    /**
   * Redirige al usuario a la página anterior
   */
  retroceder(): void {
    this.routerExtensions.back();
  }

}
