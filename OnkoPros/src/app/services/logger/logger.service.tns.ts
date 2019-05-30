import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() { }

  trace(mensaje: string): void {
    console.log(mensaje);
  }

  debug(mensaje: string): void {
    console.log(mensaje);
  }

  info(mensaje: string): void {
    console.log(mensaje);
  }

  log(mensaje: string): void {
    console.log(mensaje);
  }

  warn(mensaje: string): void {
    console.log(mensaje);
  }

  error(mensaje: string): void {
    console.log(mensaje);
  }

  fatal(mensaje: string): void {
    console.log(mensaje);
  }

}
