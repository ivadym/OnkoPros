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
  onSubmit() {
    this.authService.usuarioLogueado = this.usuario.value;
    this.authService.login().subscribe(() => {
      if (this.authService.loggedIn) {
        let redirect = this.authService.redirectURL ? this.authService.redirectURL : '/dashboard';
        this.router.navigate([redirect]);
      }
    });
  }

}
