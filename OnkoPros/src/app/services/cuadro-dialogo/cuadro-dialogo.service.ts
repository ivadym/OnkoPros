import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Usuario } from '../../classes/usuario';

import { CuadroDialogoComponent } from '../../components/cuadro-dialogo/cuadro-dialogo.component';

@Injectable({
  providedIn: 'root'
})
export class CuadroDialogoService {

  constructor(
    private dialog: MatDialog
  ) { }

  /**
   * Muestra un cuadro de diálogo de advertencia y espera la respuesta del usuario
   */
  advertencia(mensaje_1: string, mensaje_2: string): Promise<boolean> {
    const dialogRef = this.dialog.open(CuadroDialogoComponent, {
      disableClose: true,
      data : { mensaje_1: mensaje_1, mensaje_2: mensaje_2, perfiles: null, alerta: false }
    });
    
    return dialogRef.afterClosed().toPromise();
  }

  /**
   * Muestra un cuadro de diálogo de alerta y espera la respuesta del usuario
   */
  alerta(mensaje_1: string, mensaje_2:string): Promise<boolean> {
    const dialogRef = this.dialog.open(CuadroDialogoComponent, {
      disableClose: true,
      data : { mensaje_1: mensaje_1, mensaje_2: mensaje_2, perfiles: null, alerta: true }
    });
    
    return dialogRef.afterClosed().toPromise();
  }

    /**
   * Muestra un cuadro de diálogo para elegir el perfil de la sesión iniciada
   */
  seleccionPerfil(usuario: Usuario): Promise<Usuario> {
    const dialogRef = this.dialog.open(CuadroDialogoComponent, {
      disableClose: true,
      data : { 
        mensaje_1: 'Tiene asoaciados distintos perfiles a su cuenta de usuario',
        mensaje_2: 'Elija uno para iniciar sesión',
        perfiles: usuario.Perfil,
        alerta: true
      }
    });
    
    return dialogRef.afterClosed().toPromise().then(res => {
      switch(res) {
        case "Administrador": {
          usuario.Perfil = ["Administrador"];
          return usuario;
        }
        case "Profesional de la salud": {
          usuario.Perfil = ["Profesional de la salud"];
          return usuario;
        }
        case "Paciente": {
          usuario.Perfil = ["Paciente"];
          return usuario; 
        }
      }
    });
  }

}
