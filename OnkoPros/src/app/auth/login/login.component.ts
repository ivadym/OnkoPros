import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorDeAutenticacion: boolean;

  loginForm = this.formBuilder.group({
    usuario: ['', Validators.required],
    clave: ['', Validators.required]
  });

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() { }

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
  onSubmit(): void {
    this.authService.postLogin(this.usuario.value, this.clave.value).subscribe(
      usuario => {
        if (usuario && usuario.jwt) {
          this.errorDeAutenticacion = false;
          localStorage.setItem('jwt', usuario.jwt);
          let redirect = this.authService.urlInicial ? this.authService.urlInicial : '/dashboard';
          this.router.navigate([redirect]);
        } else {
          // TODO: Manejo fallo autenticación / Fichero de logs
          // TODO: Diferenciar fallo autenticación y caída posible del servidor
          this.errorDeAutenticacion = true;
          console.error('LOG onSubmit() (fallo de autenticación)');
        }
      }
    );
  }

}
