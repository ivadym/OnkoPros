import { Component, OnInit, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { RadSideDrawer } from 'nativescript-ui-sidedrawer';
import { RadSideDrawerComponent } from "nativescript-ui-sidedrawer/angular";
import { Page } from "tns-core-modules/ui/page";

import { Usuario } from '../../../../classes/usuario';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit, OnInit {

  @ViewChild(RadSideDrawerComponent) public drawerComponent: RadSideDrawerComponent;
  private drawer: RadSideDrawer;

  usuarioLogueado: Usuario;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private page: Page,
    private _changeDetectionRef: ChangeDetectorRef

  ) {
    this.authService.usuarioLogueadoObservable.subscribe(
      usuario => this.usuarioLogueado = usuario
    );
  }

  ngOnInit() {
    this.page.css = (`.nav-drawer { }`);
    if (this.router.url.includes('perfil')) {
      this.page.css = (
        `.nav-drawer {
          color: #2A367B;
          border-bottom-width: 10 !important;
          border-bottom-color: #2A367B;
        }`
      );
    }
  }

  ngAfterViewInit() {
    this.drawer = this.drawerComponent.sideDrawer;
    this._changeDetectionRef.detectChanges();
  }

  /**
   * Abre el drawer
   */
  abrirDrawer(): void {
    this.drawer.showDrawer();
  }

  /**
   * Cierra el drawer
   */
  cerrarDrawer(): void {
    this.drawer.closeDrawer();
  }

  /**
   * Cierra la sesión actual
   */
  logout(): void {
    this.page.css = (
      `.drawer-feature-logout {
        color: #2A367B;
      }`
    );
    this.authService.logout();
  }

}
