import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';

import { Item } from '../../../../../classes/item';
import { Valor } from '../../../../../classes/valor';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { NavegacionService } from '../../../../../services/navegacion/navegacion.service';
import { CuadroDialogoService } from '../../../../../services/cuadro-dialogo/cuadro-dialogo.service';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';
import { SpinnerService } from '../../../../../services/spinner/spinner.service';

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
      this.cajaTexto.nativeElement.focus();
    }, 100);
  }

  spinner: boolean = false;
  private _spinnerSubscription: Subscription;

  item: Item;
  valoresSeleccionados: Valor[];
  private idPadre: number;

  checkedValor$: Valor;
  private _checkedValorSubject: BehaviorSubject<Valor>;

  constructor(
    private route: ActivatedRoute,
    private entrevistasService: EntrevistasService,
    private navegacionService: NavegacionService,
    private spinnerService: SpinnerService,
    private cuadroDialogoService: CuadroDialogoService,
    private errorHandler: HttpErrorHandlerService,
    private _changeDetectionRef: ChangeDetectorRef

  ) {
    this._checkedValorSubject = new BehaviorSubject(null);
    this._checkedValorSubject.asObservable().subscribe(
      opcion => this.checkedValor$ = opcion
    );
  }

  ngOnInit() {
    this.idPadre = null;
    this.valoresSeleccionados = [null];
    this.extraerItem(+this.route.snapshot.paramMap.get('id'));
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
      return this.cuadroDialogoService.advertencia(
        '¿Desea abandonar la entrevista actual sin finalizarla?', 
        'Se perderán los cambios no guardados.'
      ).then(
        res => {
          if(res) {
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
  extraerItem(id: number): void {
    this.entrevistasService.getItem(id).subscribe(
      datos => {
        if(datos && datos.item && datos.idPadre && datos.tituloPadre) {
          if(datos.idPadre != this.idPadre) {
            this.idPadre = datos.idPadre;
            // TODO: Fichero de logs
            console.log('SERVIDOR - Item extraído (+ alerta): ' + datos.item.IdItem);
            this.cuadroDialogoService.alerta(
              'El siguiente bloque de preguntas corresponde a la entrevista: ',
              datos.tituloPadre
            ).then(
              res => {
                this.item = datos.item;
              }
            );
          } else {
            this.item = datos.item;
          }
         
        } else if(datos && datos.item) {
          this.idPadre = null;
          // TODO: Fichero de logs
          console.log('SERVIDOR - Item extraído: ' + datos.item.IdItem);
          this.item = datos.item;
        } else {
          console.log('LOG getItem() (no hay más items)');
          this.navegacionService.navegar(`/dashboard/entrevistas/${id}/fin`, true);
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
  enviarItemValor(item: Item): void {
    this.limpiarContexto();
    var idEntrevista = +this.route.snapshot.paramMap.get('id');
    this.entrevistasService.postItemValor(idEntrevista, item).subscribe(
      item => {
        if(item) {
          for (var i = 0; i < item.Valores.length; i++) {
            if(item.Valores[i].Alerta) {
              this.cuadroDialogoService.alerta(
                'Atención, es necesario que siga las siguientes intrucciones:',
                item.Valores[i].AlertaTexto
              ).then(
                res => {
                  console.log('SERVIDOR - Confirmación respuesta usuario (+ alerta): ' + item.IdItem);
                  this.extraerItem(idEntrevista);
                  return;
                }
              );
            }
          }
          console.log('SERVIDOR - Confirmación respuesta usuario: ' + item.IdItem);
          this.extraerItem(idEntrevista);
        } else {
          // TODO: Tratamiento del error/Mensaje de error al usuario (footer popup)
          console.error('ERROR enviarItemValor()');
        }
      },
      error => {
        //TODO: Fichero de logs
        this.errorHandler.handleError(error, `enviarItemValor(${item.IdItem})`);
      }
    )
  }

  /**
   * Actualiza los valores de la respuesta del usuario
   */
  setValor(valor: Valor): void {
    if(this.item.TipoItem === 'RB') { // RADIO BUTTON
      this.valoresSeleccionados[0] = valor;
      this._checkedValorSubject.next(valor);
    } else if(this.item.TipoItem === 'CB') { // CHECKBOX
      if(!this.valoresSeleccionados[0]) { // Primer elemento
        this.valoresSeleccionados[0] = valor;
      } else if(this.valoresSeleccionados.includes(valor)) { // Elemento ya seleccionado > Deseleccionar
        this.valoresSeleccionados.splice(this.valoresSeleccionados.indexOf(valor), 1);
      } else {
        this.valoresSeleccionados.push(valor);
      }
    }
    if (valor.CajaTexto && this.valoresSeleccionados.includes(valor)) {
      this.autofocus();
    }
  }

  /**
   * Registra la respuesta de usuario
   */
  responder(): void {
    var itemRespondido: Item = this.item;
    itemRespondido.Valores = this.valoresSeleccionados;
    this.enviarItemValor(itemRespondido);
  }

  /**
   * Limpia la pregunta descargada y la respuesta del usuario
   */
  limpiarContexto(): void {
    this.item = null;
    this.valoresSeleccionados = [null];
    this.checkedValor$ = null;
  }

}
