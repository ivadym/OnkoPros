import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Validators, FormBuilder } from '@angular/forms';

import { AuthService } from '../../../../services/auth/auth.service';
import { CuadroDialogoService } from '../../../../services/cuadro-dialogo/cuadro-dialogo.service';
import { HttpErrorHandlerService } from '../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  @ViewChild("usuarioField") usuarioField: ElementRef;

  /**
   * Centra el cursor en el campo de "Usuario" al cargarse la página
   */
  autofocus(): void {
    setTimeout(() => {
      this.usuarioField.nativeElement.focus();
    }, 500);
  }

  loginForm = this.formBuilder.group({
    usuario: ['', Validators.required],
    clave: ['', Validators.required]
  });

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private cuadroDialogoService: CuadroDialogoService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  ngOnInit() {
    // this.autofocus();
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
    this.authService.postLogin(this.usuario.value, this.clave.value).subscribe(
      usuario => {
        if (usuario && usuario.jwt) {
          // TODO: Fichero de logs
          console.log('SERVIDOR - Autenticación: ' + usuario.usuario + '/' + usuario.jwt);
          this.authService.usuarioLogueado = usuario;
          let redirect = this.authService.urlInicial ? this.authService.urlInicial : '/dashboard';
          this.router.navigate([redirect]);
        } else {
          // TODO: ¿Código nunca alcanzable?
          // TODO: Manejo fallo autenticación / Fichero de logs
          // TODO: Diferenciar fallo autenticación y caída posible del servidor
          // console.error('LOG login() (fallo de autenticación)');
        }
      },
      error => {
        if(error.status === 403) {
          this.cuadroDialogoService.alerta(
            "Las credenciales introducidas son incorrectas.",
            "Vuelva a intentarlo o contacte con su personal clínico."
          );
        }
        this.errorHandler.handleError(error, 'login()');
      }
    );
  }

}