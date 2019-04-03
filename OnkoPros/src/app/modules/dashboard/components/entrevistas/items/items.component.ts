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
  
  @ViewChild("otroField") otroField: ElementRef;

  /**
   * Centra el cursor en el campo de "Respuesta personalizada" cuando se seleciona la opción "Otro"
   */
  autofocus(valor: string): void {
    if (valor == 'Otro' && this.valores_seleccionados.indexOf(valor) >= 0) {
      setTimeout(() => {
        this.otroField.nativeElement.focus();
      }, 100);
    }
  }

  spinner: boolean = false;
  private _spinnerSubscription: Subscription;

  item: Item;
  valor: Valor;
  valor_personal: string;
  private valores_seleccionados: string[];

  checked$: string;
  private _checkedSubject: BehaviorSubject<string>;

  constructor(
    private route: ActivatedRoute,
    private entrevistasService: EntrevistasService,
    private navegacionService: NavegacionService,
    private spinnerService: SpinnerService,
    private cuadroDialogoService: CuadroDialogoService,
    private errorHandler: HttpErrorHandlerService,
    private _changeDetectionRef: ChangeDetectorRef

  ) {
    this._checkedSubject = new BehaviorSubject("");
    this._checkedSubject.asObservable().subscribe(
      opcion => this.checked$ = opcion
    );
  }

  ngOnInit() {
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
      item => {
        if(item) {
          //TODO: Fichero de logs
          console.log('SERVIDOR - Item extraído: ' + item.titulo);
          this.item = item;
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
  enviarValor(id_entrevista: number, valor: Valor): void {
    this.entrevistasService.postValor(id_entrevista, valor).subscribe(
      datos => {
        if(datos.alerta) {
          this.cuadroDialogoService.alerta(
            'Atención, es necesario que siga las siguientes intrucciones:',
            datos.alerta
          ).then(
            res => {
              console.log('SERVIDOR - Confirmación respuesta usuario: ');
              console.log(datos.valor.id); console.log(datos.valor.valores);
              this.limpiarContexto();
              this.extraerItem(id_entrevista);
            }
          );
        } else if(datos.valor) {
          console.log('SERVIDOR - Confirmación respuesta usuario: ');
          console.log(datos.valor.id); console.log(datos.valor.valores);
          this.limpiarContexto();
          this.extraerItem(id_entrevista);
        } else {
          // TODO: Tratamiento del error/Mensaje de error al usuario (footer popup)
          console.error('ERROR enviarValor()');
        }
      },
      error => {
        //TODO: Fichero de logs
        this.errorHandler.handleError(error, `enviarValor(${id_entrevista}, ${valor.id})`);
      }
    )
  }

  /**
   * Actualiza los valores de la respuesta del usuario
   */
  setValor(id: number, valor: string): void {
    if(this.item.tipo === 'radio') { // RADIO BUTTON
      this.valores_seleccionados = [valor];
      this._checkedSubject.next(valor);
    } else if(this.item.tipo === 'checkbox') { // CHECKBOX
      if(!this.valores_seleccionados) {
        this.valores_seleccionados = [valor];
      } else if(this.valores_seleccionados.indexOf(valor) >= 0) {
        this.valores_seleccionados.splice(this.valores_seleccionados.indexOf(valor), 1);
      } else {
        this.valores_seleccionados.push(valor);
      }
    }

    this.autofocus(valor);

    this.valor = {
      id: id,
      titulo: this.item.titulo,
      tipo: this.item.tipo,
      valores: this.valores_seleccionados
    }
  }

  /**
   * Registra la respuesta de usuario
   */
  responder(): void {
    const id = +this.route.snapshot.paramMap.get('id');
    if(this.valores_seleccionados.indexOf('Otro') >= 0 && this.valor_personal != null  && this.valor_personal != '') {
        this.valor.valores[this.valores_seleccionados.indexOf('Otro')] = this.valor_personal;
    }
    this.enviarValor(id, this.valor);
  }

  /**
   * Limpia la pregunta descargada y la respuesta del usuario
   */
  limpiarContexto(): void {
    this.item = null;
    this.valor = null;
    this.valores_seleccionados = null;
    this.valor_personal = null;
    this.checked$ = null;
  }

}
