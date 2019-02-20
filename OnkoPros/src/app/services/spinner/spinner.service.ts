import { Injectable } from '@angular/core';

import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  constructor(
    private spinner: NgxSpinnerService
  ) { }

  /**
   * Muestra el spinner
   */
  show(): void {
    this.spinner.show();
  }

  /**
   * Oculta el spinner
   */
  hide(): void {
    this.spinner.hide();
  }
  
}
