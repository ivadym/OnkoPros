import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';

import { Item } from '../../../../../classes/item';
import { Valor } from '../../../../../classes/valor';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { NavegacionService } from '../../../../../services/navegacion/navegacion.service';
import { CuadroDialogoService } from '../../../../../services/cuadro-dialogo/cuadro-dialogo.service';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';
import { SpinnerService } from '../../../../../services/spinner/spinner.service';
import { LoggerService } from '../../../../../services/logger/logger.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.css']
})
export class ItemsComponent implements OnInit {
  
  @ViewChild("cajaTexto") cajaTexto: ElementRef;

  /**
   * Centra el cursor en el campo de "Respuesta personalizada" cuando se seleciona la opción con la caja de texto
   */
  autofocus(): void {
    setTimeout(() => {
      if (this.cajaTexto) {
        this.cajaTexto.nativeElement.focus();
      }
    }, 100);
  }

  spinner: boolean = false;
  private _spinnerSubscription: Subscription;

  item: Item;
  idItemsRespondidos: number[] = [];
  paginaSeleccionada: number = null;
  tituloValores: string[] = []; // Uso exclusivo Select Button {N}
  valoresSeleccionados: Valor[] = [];
  indiceSeleccionado: number = null;

  checkedValor$: Valor;
  private _checkedValorSubject: BehaviorSubject<Valor>;

  constructor(
    private route: ActivatedRoute,
    private entrevistasService: EntrevistasService,
    private navegacionService: NavegacionService,
    private spinnerService: SpinnerService,
    private cuadroDialogoService: CuadroDialogoService,
    private logger: LoggerService,
    private errorHandler: HttpErrorHandlerService,
    private _changeDetectionRef: ChangeDetectorRef

  ) {
    this._checkedValorSubject = new BehaviorSubject(null);
    this._checkedValorSubject.asObservable().subscribe(
      opcion => this.checkedValor$ = opcion
    );
  }

  ngOnInit() {
    this.extraerSiguienteItem(+this.route.snapshot.paramMap.get('id'));
    this._spinnerSubscription = this.spinnerService.estadoSpinnerObservable.subscribe(
      estado => {
        this.spinner = estado,
        this._changeDetectionRef.detectChanges()
      }
    );
  }

  ngOnDestroy() {
    this._spinnerSubscription.unsubscribe();
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
      this.logger.log('Activado el guard asociado a canDeactivate')
      return this.cuadroDialogoService.advertencia(
        '¿Desea abandonar la entrevista actual sin finalizarla?', 
        'Se perderán los cambios no guardados.'
      ).then(
        res => {
          if (res) {
            return true;
          } else {
            return false;
          }
        }
      );
    } else {
      return true;
    }
  }

  /**
   * Lista la pregunta extraida por el servidor
   */
  extraerSiguienteItem(idEntrevista: number): void {
    this.entrevistasService.getSiguienteItem(idEntrevista).subscribe(
      datos => {
        if (datos && datos.item && datos.idItemsRespondidos) {
          this.logger.log(`Item extraído correctamente (id: ${datos.item.IdItem})`);
          this.item = datos.item;
          this.idItemsRespondidos = datos.idItemsRespondidos;
          this.idItemsRespondidos.push(datos.item.IdItem);
          this.paginaSeleccionada = this.idItemsRespondidos.indexOf(datos.item.IdItem) + 1;

          this.actualizarSeleccionDefecto(datos.item.Valores);
          
          if (datos.item.TipoItem === 'SB') {
            this.actualizarTituloValores(datos.item.Valores);
          }
        } else {
          this.logger.log(`No quedan items asociados a la entrevista con id: ${idEntrevista})`);
          this.navegacionService.navegar(`/dashboard/entrevistas/${idEntrevista}/fin`, true);
        }
      },
      error => {
        this.errorHandler.handleError(error, `getSiguienteItem(${idEntrevista})`);
      }
    )
  }
  
  /**
   * Extrae el item asociado a un ID específico
   */
  extraerItemRespondido(): void {
    var idEntrevista = this.item.IdEntrevista;
    if (this.paginaSeleccionada >= this.idItemsRespondidos.length ) { // Seleccionado el último ítem extraído (no contestado aún)
      this.limpiarContexto();
      this.extraerSiguienteItem(idEntrevista);
    } else {
      var idItemSoclicitado = this.idItemsRespondidos[this.paginaSeleccionada - 1];
      var idUltimoItem = this.idItemsRespondidos[this.idItemsRespondidos.length - 1];
      this.limpiarContexto();
      this.entrevistasService.getItemRespondido(idEntrevista, idItemSoclicitado).subscribe(
        datos => {
          this.logger.log(`Item respondido extraído correctamente (id: ${datos.item.IdItem})`);
          this.item = datos.item;
          datos.idItemsRespondidos.push(idUltimoItem); // Mantener último contexto
          this.idItemsRespondidos = datos.idItemsRespondidos;
          this.paginaSeleccionada = this.idItemsRespondidos.indexOf(datos.item.IdItem) + 1;
          
          this.actualizarSeleccionDefecto(datos.item.Valores);
          
          if (datos.item.TipoItem === 'SB') {
            this.actualizarTituloValores(datos.item.Valores);
          }
        },
        error => {
          this.errorHandler.handleError(error, `getItemRespondido(${idEntrevista}, ${idItemSoclicitado})`);
        }
      )
    }
  }

  /**
   * Envía la respuesta del usuario y actualiza el contexto (limpia los campos obsoletos y extrae el nuevo item)
   */
  enviarItem(item: Item): void {
    var observableItemValor: Observable<any> = null;
    if (this.idItemsRespondidos.slice(0, this.idItemsRespondidos.length - 1).includes(item.IdItem)) { // Actualizado item/valor
      observableItemValor = this.entrevistasService.postActualizarItem(item);
    } else { // Enviado nuevo item/valor
      observableItemValor = this.entrevistasService.postItem(item);
    }
     
    this.limpiarContexto();
    observableItemValor.subscribe(
      item => {
        this.logger.log(`Item enviado correctamente (id: ${item.IdItem})`);
        for (var i = 0; i < item.Valores.length; i++) {
          if (item.Valores[i].Alerta) {
            this.cuadroDialogoService.alerta(
              'Atención, es necesario que siga las siguientes intrucciones:',
              item.Valores[i].Alerta
            ).then(
              res => {
                this.extraerSiguienteItem(item.IdEntrevista);
                return;
              }
            );
          }
        }
        this.extraerSiguienteItem(item.IdEntrevista);
      },
      error => {
        this.errorHandler.handleError(error, `enviarItem(${item.IdItem})`);
      }
    )
  }

  /**
   * Actualiza el item con los valores por defecto o respondidos anteriormente
   */
  actualizarSeleccionDefecto(valores: Valor[]) {
    for (let i = 0; i < valores.length; i++) {
      if (this.item.Valores[i].Seleccionado) {
        this.indiceSeleccionado = i;
        this.setValor(this.item.Valores[i]);
      }
    }
  }

  /**
   * Actualiza los valores de la respuesta del usuario
   */
  setValor(valor: Valor): void {
    if (this.item.TipoItem === 'RB') { // RADIO BUTTON
      this.valoresSeleccionados = [valor];
      this._checkedValorSubject.next(valor);
    } else if (this.item.TipoItem === 'CB') { // CHECKBOX
      if (!this.valoresSeleccionados[0]) { // Primer elemento
        this.valoresSeleccionados = [valor];
      } else if (this.valoresSeleccionados.includes(valor)) { // Elemento ya seleccionado > Deseleccionar
        this.valoresSeleccionados.splice(this.valoresSeleccionados.indexOf(valor), 1);
      } else {
        this.valoresSeleccionados.push(valor);
      }
    } else if (this.item.TipoItem === 'SB') { // SELECT BUTTON
      setTimeout(() => { // Workaround al bug de data binding del DropDown ({N} plugin)
        this.valoresSeleccionados = [this.item.Valores[this.indiceSeleccionado]];
        if (this.valoresSeleccionados[0].CajaTexto) {
          this.autofocus();
        }
      }, 100);  
    }

    if (valor && valor.CajaTexto && this.valoresSeleccionados.includes(valor)) {
      this.autofocus();
    }
  }

  /**
   * Despliega el tooltip asociado al item mostrado
   */
  mostrarTooltip(): void {
    this.logger.log('Tooltip desplegado');
    this.cuadroDialogoService.alerta(
      null,
      this.item.Tooltip
    ).then(
      res => {
        return;
      }
    );
  }

  /**
   * Actualiza los títulos de los valores (implementación exclusiva {Nativescript})
   */
  actualizarTituloValores(valores: any): void {
    for (const key in valores) {
      if (valores[key].VisibleValor) {
        this.tituloValores.push(valores[key].Titulo + " (" + valores[key].Valor + ")");
      } else {
        this.tituloValores.push(valores[key].Titulo);
      }
    }
  }

  /**
   * Registra la respuesta de usuario
   */
  responder(): void {
    var itemRespondido: Item = this.item;
    itemRespondido.Valores = this.valoresSeleccionados;
    this.enviarItem(itemRespondido);
  }

  /**
   * Limpia la pregunta descargada y la respuesta del usuario
   */
  limpiarContexto(): void {
    this.item = null;
    this.idItemsRespondidos = [];
    this.paginaSeleccionada = null;
    this.tituloValores = [];
    this.valoresSeleccionados = [];
    this.indiceSeleccionado = null;
    this.checkedValor$ = null;
  }

}
