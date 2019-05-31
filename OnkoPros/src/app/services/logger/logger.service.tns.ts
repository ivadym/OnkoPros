import { Injectable } from '@angular/core';
import * as trace from "tns-core-modules/trace";
import { isUndefined } from "tns-core-modules/utils/types";

import { environment } from '../../../environments/environment';

/**
 * Tracer personalizado
 */
var writerPersonalizado = (function () {
  function writerPersonalizado() { }
  writerPersonalizado.prototype.write = function (message, category, type) {
    if (!console) {
      return;
    }

    var msgType = isUndefined(type) ? trace.messageType.log : type;
    var traceMessage = new Date().toISOString() + " " + category + ": " + message;
 
    switch (msgType) {
      case trace.messageType.log:
        console.log(traceMessage);
        break;
      case trace.messageType.info:
        console.info(traceMessage);
        break;
      case trace.messageType.warn:
        console.warn(traceMessage);
        break;
      case trace.messageType.error:
        console.error(traceMessage);
        break;
    }
  };
  return writerPersonalizado;
})();

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor() {
    if (!environment.production) {
      trace.disable();
      trace.setCategories(trace.categories.concat(
        trace.categories.Debug,
        trace.categories.Error
      ));
      trace.clearWriters();
      trace.addWriter(new writerPersonalizado());
      trace.enable();
    } else {
      trace.disable();
    }
  }

  trace(mensaje: string): void {
    trace.write(mensaje, trace.categories.Debug, trace.messageType.log);
  }

  debug(mensaje: string): void {
    trace.write(mensaje, trace.categories.Debug, trace.messageType.log);
  }

  info(mensaje: string): void {
    trace.write(mensaje, trace.categories.Debug, trace.messageType.info);
  }

  log(mensaje: string): void {
    trace.write(mensaje, trace.categories.Debug, trace.messageType.log);
  }

  warn(mensaje: string): void {
    trace.write(mensaje, trace.categories.Debug, trace.messageType.warn);
  }

  error(mensaje: string): void {
    trace.write(mensaje, trace.categories.Error, trace.messageType.error);
  }

  fatal(mensaje: string): void {
    trace.write(mensaje, trace.categories.Error, trace.messageType.error);
  }

}
