import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../../services/auth/auth.service';
import { NavegacionService } from '../../../../services/navegacion/navegacion.service';
import { SpinnerService } from '../../../../services/spinner/spinner.service';
import { CuadroDialogoService } from '../../../../services/cuadro-dialogo/cuadro-dialogo.service';
import { HttpErrorHandlerService } from '../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  spinner: boolean = false;
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
    private errorHandler: HttpErrorHandlerService,
    private _changeDetectionRef: ChangeDetectorRef
  ) {
    this._spinnerSubscription = this.spinnerService.estadoSpinnerObservable.subscribe(
      estado => this.spinner = estado
    );
  }

  ngOnInit() { }

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
        if (usuario && usuario.JWT) {
          // TODO: Fichero de logs
          if(usuario.Perfil.length > 1) { // Usuario con múltiples perfiles
            this.cuadroDialogoService.seleccionPerfil(usuario).then(
              res => {
                if(res) {
                  console.log('SERVIDOR - Autenticación: ' + res.Usuario + '/' + res.JWT);
                  this.authService.usuarioLogueado = res;
                  let redirect = this.authService.urlInicial ? this.authService.urlInicial : '';
                  this.navegacionService.navegar(redirect, true);
                } else {
                  return; // El usuario ha cancelado la selección de perfil (y por lo tanto el login)
                }
              }
            );
          } else { // Usuario con un único perfil
            console.log('SERVIDOR - Autenticación: ' + usuario.Usuario + '/' + usuario.JWT);
            this.authService.usuarioLogueado = usuario;
            let redirect = this.authService.urlInicial ? this.authService.urlInicial : '';
            this.navegacionService.navegar(redirect, true);
          }
        } else {
          // TODO: ¿Código nunca alcanzable?
          // TODO: Manejo fallo autenticación / Fichero de logs
          // TODO: Diferenciar fallo autenticación y caída posible del servidor
          console.log('LOG login() (fallo de autenticación)');
        }
      },
      error => {
        this._changeDetectionRef.detectChanges();
        if(error.status === 403) {
          this.cuadroDialogoService.alerta(
            'Las credenciales introducidas son incorrectas.',
            'Vuelva a intentarlo o contacte con su personal clínico.'
          );
        }
        this.errorHandler.handleError(error, 'login()');
      }
    );
  }

}
