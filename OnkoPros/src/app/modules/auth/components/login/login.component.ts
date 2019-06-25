import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../../services/auth/auth.service';
import { NavegacionService } from '../../../../services/navegacion/navegacion.service';
import { SpinnerService } from '../../../../services/spinner/spinner.service';
import { CuadroDialogoService } from '../../../../services/cuadro-dialogo/cuadro-dialogo.service';
import { LoggerService } from '../../../../services/logger/logger.service';
import { HttpErrorHandlerService } from '../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  spinner: boolean = false;
  hidePassword: boolean = true;
  private _spinnerSubscription: Subscription;

  loginForm = this.formBuilder.group({
    usuario: ['', Validators.required],
    clave: ['', Validators.required]
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private navegacionService: NavegacionService,
    private spinnerService: SpinnerService,
    private cuadroDialogoService: CuadroDialogoService,
    private logger: LoggerService,
    private errorHandler: HttpErrorHandlerService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {
    this._spinnerSubscription = this.spinnerService.estadoSpinnerObservable.subscribe(
      estado => this.spinner = estado
    );
  }

  ngOnInit() {
    this.hidePassword = true;
  }

  ngOnDestroy() {
    this._spinnerSubscription.unsubscribe();
  }

  /**
   * Devuelve el nombre de usuario introducido en el login form
   */
  get usuario() {
    return this.loginForm.get('usuario');
  }
  
  /**
   * Devuelve la clave de usuario introducida en el login form
   */
  get clave() {
    return this.loginForm.get('clave'); 
  }

/**
   * Verifica las credenciales introducidas
   */
  login(): void {
    this._changeDetectionRef.detectChanges();
    this.authService.postLogin(this.usuario.value, this.clave.value).subscribe(
      usuario => {
        this.logger.log(`Usuario logueado correctamente (id: ${usuario.IdUsuario})`);
        if (usuario.Perfil.length > 1) { // Usuario con múltiples perfiles
          this.cuadroDialogoService.seleccionPerfil(usuario)
          .then(res => {
            if (res) {
              this.authService.usuarioLogueado = res;
              let redirect = this.authService.urlInicial ? this.authService.urlInicial : '';
              this.navegacionService.navegar(redirect, true);
            } else {
              return; // El usuario ha cancelado la selección de perfil (y por lo tanto el login)
            }
          });
        } else { // Usuario con un único perfil
          this.authService.usuarioLogueado = usuario;
          let redirect = this.authService.urlInicial ? this.authService.urlInicial : '';
          this.navegacionService.navegar(redirect, true);
        }
      },
      error => {
        this._changeDetectionRef.detectChanges();
        if (error.status === 403) {
          this.cuadroDialogoService.alerta(
            'Las credenciales introducidas son incorrectas.',
            'Vuelva a intentarlo o contacte con su personal clínico.'
          ).then(res => {
            this.loginForm.controls['usuario'].setValue(this.loginForm.get('usuario').value); // Se mantiene nombre de usuario introducido
            this.loginForm.controls['clave'].setValue('');
            this.hidePassword = true;
            return;
          });
        }
        this.errorHandler.handleError(error, 'login()');
      }
    );
  }

}
