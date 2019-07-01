import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompartirService {

  constructor() { }
  
  private emitChangeSubject = new BehaviorSubject<any>(null);
  changeEmitted$ = this.emitChangeSubject.asObservable();

  emitChange(valor: any) {
    this.emitChangeSubject.next(valor);
  }
  
}
