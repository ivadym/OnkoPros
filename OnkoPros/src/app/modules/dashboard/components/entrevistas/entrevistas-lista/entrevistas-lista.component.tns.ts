import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ListViewEventData, PullToRefreshStyle } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { Color } from "tns-core-modules/color";
import { Subscription } from 'rxjs';

import { Entrevista } from '../../../../../classes/entrevista';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { SpinnerService } from '../../../../../services/spinner/spinner.service';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-entrevistas-lista',
  templateUrl: './entrevistas-lista.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./entrevistas-lista.component.css']
})
export class EntrevistasListaComponent implements OnInit {

  @ViewChild("listView") listViewComponent: RadListViewComponent;

  spinner: boolean = false;
  private _spinnerSubscription: Subscription;

  entrevistas: Entrevista[];
  entrevistasDisponibles: boolean = true;

  constructor(
    private entrevistasService: EntrevistasService,
    private spinnerService: SpinnerService,
    private errorHandler: HttpErrorHandlerService
  ) {
    this._spinnerSubscription = this.spinnerService.estadoSpinnerObservable.subscribe(
      estado => this.spinner = estado
    );
  }

  ngOnInit() {
    this.extraerEntrevistas(null);
    if (this.listViewComponent && this.listViewComponent.listView) {
      let style = new PullToRefreshStyle();
      style.indicatorColor = new Color("white");
      style.indicatorBackgroundColor = new Color("#2A367B");
      this.listViewComponent.listView.pullToRefreshStyle = style;
    }
  }
  
  ngOnDestroy() {
    this._spinnerSubscription.unsubscribe();
  }

  /**
   * Lista las entrevistas extraídas del servidor
   */
  extraerEntrevistas(args: ListViewEventData): void {
    this.entrevistasService.getEntrevistas().subscribe(
      entrevistas => {
        if(entrevistas) {
          //TODO: Fichero de logs
          console.log('SERVIDOR - Entrevistas: ' + entrevistas.length);
          this.entrevistas = entrevistas;
          this.entrevistasDisponibles = true;
        } else {
          console.error("LOG getEntrevistas() (no hay más entrevistas disponibles)");
          this.entrevistasDisponibles = false;
        }
        args ? args.object.notifyPullToRefreshFinished() : null;
      },
      error => {
        this.errorHandler.handleError(error, 'getEntrevistas()');
      }
    );
  }

}
