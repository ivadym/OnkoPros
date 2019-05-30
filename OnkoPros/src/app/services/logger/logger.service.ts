import { Injectable } from '@angular/core';

import { NGXLogger } from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor(
    private ngxLogger: NGXLogger
  ) { }

  trace(mensaje: string): void {
    this.ngxLogger.trace(mensaje);
  }

  debug(mensaje: string): void {
    this.ngxLogger.debug(mensaje);
  }

  info(mensaje: string): void {
    this.ngxLogger.info(mensaje);
  }

  log(mensaje: string): void {
    this.ngxLogger.log(mensaje);
  }

  warn(mensaje: string): void {
    this.ngxLogger.warn(mensaje);
  }

  error(mensaje: string): void {
    this.ngxLogger.error(mensaje);
  }

  fatal(mensaje: string): void {
    this.ngxLogger.fatal(mensaje);
  }

}
