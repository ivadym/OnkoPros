import { Component, OnInit, ViewChild } from '@angular/core';
import { ListViewEventData, PullToRefreshStyle } from "nativescript-ui-listview";
import { RadListViewComponent } from "nativescript-ui-listview/angular";
import { Color } from "tns-core-modules/color";
import { Subscription } from 'rxjs';

import { Entrevista } from '../../../../../classes/entrevista';

import { EntrevistasService } from '../../../../../services/entrevistas/entrevistas.service';
import { SpinnerService } from '../../../../../services/spinner/spinner.service';
import { LoggerService } from '../../../../../services/logger/logger.service.tns';
import { HttpErrorHandlerService } from '../../../../../services/error-handler/http-error-handler.service';

@Component({
  selector: 'app-entrevistas-lista',
  templateUrl: './entrevistas-lista.component.html',
  styleUrls: ['./entrevistas-lista.component.css']
})
export class EntrevistasListaComponent implements OnInit {

  @ViewChild("listView") listViewComponent: RadListViewComponent;

  spinner: boolean = false;
  private _spinnerSubscription: Subscription;

  entrevistas: Entrevista[] = [];
  entrevistasDisponibles: boolean = true;

  constructor(
    private entrevistasService: EntrevistasService,
    private spinnerService: SpinnerService,
    private logger: LoggerService,
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
        args ? args.object.notifyPullToRefreshFinished() : null;
        if (entrevistas) {
          this.logger.log(`Lista de entrevistas extraída (núm. entrevistas: ${entrevistas.length})`);
          this.entrevistas = entrevistas;
          this.entrevistasDisponibles = true;
        } else {
          this.logger.log('No quedan entrevistas pendientes/disponibles');
          this.entrevistasDisponibles = false;
        }
      },
      error => {
        args ? args.object.notifyPullToRefreshFinished() : null;
        this.errorHandler.handleError(error, 'extraerEntrevistas()');
      }
    );
  }

}
