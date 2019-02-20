import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, RouterStateSnapshot, ActivatedRouteSnapshot, Router } from '@angular/router';

import { Item } from '../item';
import { Valor } from '../valor';

import { EntrevistasService } from '../entrevistas.service';
import { HttpErrorHandlerService } from 'src/app/http-error-handler.service';
import { AvisosService } from 'src/app/avisos.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {
  
  @ViewChild("otro") nameField: ElementRef;
  autofocus(valor: string): void {
    if (valor == 'Otro' && this.valoresSeleccionados.indexOf(valor) >= 0) {
      setTimeout(() => {
        this.nameField.nativeElement.focus();
      }, 50);
    }
  }

  item: Item;
  valor: Valor;
  private valoresSeleccionados: string[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entrevistasService: EntrevistasService,
    private avisosService: AvisosService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.extraerItem(+this.route.snapshot.paramMap.get('id'));
  }

  /**
   * Controla la navegación desde la ruta actual hacia el exterior
   */
  canDeactivate(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Promise<boolean> | boolean {
    if (this.item && nextState.url != '/login') {
      return this.avisosService.advertencia(
        '¿Desea abandonar la entrevista actual sin finalizarla?', 
        'Se perderán los cambios no guardados.'
      ).then(
        res => {
          return true;
        },
        error => {
          return false;
        }
      );
    } else {
      return true;
    }
  }

  /**
   * Lista la pregunta extraida por el servidor
   */
  extraerItem(id: number): void {
    this.entrevistasService.getItem(id).subscribe(
      item => {
        if(item) {
          //TODO: Fichero de logs
          console.log('SERVIDOR - Item extraído: ' + item.titulo);
          this.item = item;
        } else {
          console.error('LOG getItem() (no hay más items)');
          this.router.navigate([`/dashboard/entrevistas/${id}/fin`]);
        }
      },
      error => {
        this.errorHandler.handleError(error, `getItem(${id})`);
      }
    )
  }

  /**
   * Envía la respuesta del usuario y actualiza el contexto (limpia los campos obsoletos y extrae nuevo item)
   */
  enviarValor(entrevistaId: number, valor: Valor): void {
    this.entrevistasService.postValor(entrevistaId, valor).subscribe(
      datos => {
        if(datos.alerta) {
          this.avisosService.alerta(
            'Según los resultados reportados, es necesario que siga las siguientes intrucciones:',
            datos.alerta
          ).then(
            res => {
              console.log('SERVIDOR - Confirmación respuesta usuario: ');
              console.log(datos.valor.id); console.log(datos.valor.valor); console.log(datos.valor.valorTexto);
              this.clearItemActual();
              this.clearValorActual();
              this.extraerItem(entrevistaId);
            }
          );
        } else if(datos.valor) {
          console.log('SERVIDOR - Confirmación respuesta usuario: ');
          console.log(datos.valor.id); console.log(datos.valor.valor); console.log(datos.valor.valorTexto);
          this.clearItemActual();
          this.clearValorActual();
          this.extraerItem(entrevistaId);
        } else {
          // TODO: Tratamiento del error/Mensaje de error al usuario (footer popup)
          console.error('ERROR enviarValor()');
        }
      },
      error => {
        //TODO: Fichero de logs
        this.errorHandler.handleError(error, `enviarValor(${valor.id}, ${valor.valor}, ${valor.valorTexto})`);
      }
    )
  }

  /**
   * Actualiza los valores de la respuesta del usuario
   */
  setValor(id: number, valor: string): void {
    if(this.item.tipo === 'radio') { // RADIO BUTTON
      this.valoresSeleccionados = [valor];
    } else if(this.item.tipo === 'checkbox') { // CHECKBOX
      if(!this.valoresSeleccionados) {
        this.valoresSeleccionados = [valor];
      } else if(this.valoresSeleccionados.indexOf(valor) >= 0) {
        this.valoresSeleccionados.splice(this.valoresSeleccionados.indexOf(valor), 1);
      } else {
        this.valoresSeleccionados.push(valor);
      }
    }

    this.autofocus(valor);

    this.valor = {
      id: id,
      valor: this.valoresSeleccionados,
      valorTexto: this.valor ? this.valor.valorTexto : null
    }
  }

  /**
   * Registra la respuesta de usuario
   */
  responder(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    if(this.valoresSeleccionados.indexOf('Otro') < 0) {
      this.valor.valorTexto = null;
    }
    this.enviarValor(id, this.valor);
  }

  /**
   * Limpia la pregunta actual
   */
  clearItemActual(): void {
    this.item = null;
  }

  /**
   * Limpia la respuesta del usuario
   */
  clearValorActual(): void {
    this.valoresSeleccionados = null;
    this.valor = null;
  }

}
