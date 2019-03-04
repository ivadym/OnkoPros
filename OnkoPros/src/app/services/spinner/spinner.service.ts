import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private _estadoSpinnerSubject: BehaviorSubject<boolean>;
  private _estadoSpinner: Observable<boolean>;

  constructor(
    private spinner: NgxSpinnerService
  ) {
    this._estadoSpinnerSubject = new BehaviorSubject(false);
    this._estadoSpinner = this._estadoSpinnerSubject.asObservable();
  }

  /**
   * GET usuario logueado (observable)
   */
  get estadoSpinnerObservable(): Observable<boolean> {
    return this._estadoSpinner;
  }

  /**
   * Muestra el spinner
   */
  show(): void {
    this.spinner.show();
    this._estadoSpinnerSubject.next(true);
  }

  /**
   * Oculta el spinner
   */
  hide(): void {
    this.spinner.hide();
    this._estadoSpinnerSubject.next(false);
  }
  
}
