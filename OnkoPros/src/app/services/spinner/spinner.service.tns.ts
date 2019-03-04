import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  private _estadoSpinnerSubject: BehaviorSubject<boolean>;
  private _estadoSpinner: Observable<boolean>;

  constructor() {
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
    this._estadoSpinnerSubject.next(true);
  }

  /**
   * Oculta el spinner
   */
  hide(): void {
    this._estadoSpinnerSubject.next(false);
  }
  
}
