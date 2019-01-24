import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';

import { Item } from '../item';
import { Valor } from '../valor';

import { AdvertenciasService } from '../../../advertencias.service';
import { EntrevistasService } from '../entrevistas.service';
import { NavegacionService } from 'src/app/navegacion.service';
import { HttpErrorHandlerService } from 'src/app/http-error-handler.service';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.css']
})
export class ItemComponent implements OnInit {

  item: Item;
  valor: Valor;
  itemDisponible: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private entrevistasService: EntrevistasService,
    private advertenciasService: AdvertenciasService,
    private navegacionService: NavegacionService,
    private errorHandler: HttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.getItem(+this.route.snapshot.paramMap.get('id'));
  }

  /**
   * Controla la navegación desde la ruta actual hacia el exterior
   */
  canDeactivate(
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    if (this.item && nextState.url != '/login') {
      return this.advertenciasService.advertencia('¿Desea abandonar la entrevista actual sin finalizarla?');
    } else {
      return true;
    }
  }

  /**
   * Lista la pregunta enviada por el servidor
   */
  getItem(id: number): void {
    this.entrevistasService.getItem(id).subscribe(
      item => {
        if(item) {
          //TODO: Fichero de logs
          console.log('SERVIDOR - Item extraído: ' + item.titulo);
          this.item = item,
          this.itemDisponible = true;
        } else {
          console.error('LOG getItem() (no hay más items)');
          this.itemDisponible = false;
        }
      },
      error => {
        this.errorHandler.handleError(error, `getItem(${id})`);
      }
    )
  }

  /**
   * Envío de la respuesta del usuario y actualización de la pregunta
   */
  enviarValor(entrevistaId: number, valor: Valor): void {
    this.entrevistasService.postValor(entrevistaId, valor).subscribe(
      valor => {
        if(valor) {
          console.log('SERVIDOR - Confirmación respuesta usuario: ' + 
          valor.id + '/' + valor.valor + '/' + valor.valorTexto);
          this.clearItemActual(),
          this.clearValorActual(),
          this.getItem(entrevistaId)
        } else {
          // TODO: Tratamiento del error/Mensaje de error al usuario (footer popup)
          console.error('ERROR enviarValor()');
        }
      },
      error => {
        //TODO: Fichero de logs
        this.errorHandler.handleError(error, `enviarValor(${valor.id}, ${valor.valor}, ${valor.valorTexto})`)
      }
    )
  }

  /**
   * Actualiza la respuesta del usuario
   */
  setValor(id: number, valor: string, valorTexto: string): void {
    this.valor = {
      id: this.item.id,
      valor: valor,
      valorTexto: null
    }
  }
  
  /**
   * Registra la respuesta de usuario
   */
  responder(): void {
    const entrevistaId = +this.route.snapshot.paramMap.get('id');
    this.enviarValor(entrevistaId, this.valor);
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
    this.valor = null;
  }

  /**
   * Redirige al usuario a la lista de entrevistas
   */
  goToEntrevistas(): void {
    this.navegacionService.goToEntrevistas();
  }

  /**
   * Redirige al usuario a la página de inicio
   */
  goToInicio(): void {
    this.navegacionService.goToInicio();
  }

}
