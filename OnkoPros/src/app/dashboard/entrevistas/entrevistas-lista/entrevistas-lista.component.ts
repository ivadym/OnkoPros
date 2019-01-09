import { Component, OnInit } from '@angular/core';

import { Entrevista } from '../entrevista';

import { EntrevistasService } from '../entrevistas.service';

@Component({
  selector: 'app-entrevistas-lista',
  templateUrl: './entrevistas-lista.component.html',
  styleUrls: ['./entrevistas-lista.component.css']
})
export class EntrevistasListaComponent implements OnInit {

  entrevistas: Entrevista[];
  entrevistasDisponibles: boolean = true;

  constructor(
    private entrevistasService: EntrevistasService
  ) { }

  ngOnInit() {
    this.getEntrevistas();
  }

  /**
   * Lista las entrevistas enviadas por el servidor
   */
  getEntrevistas(): void {
    this.entrevistasService.getEntrevistas().subscribe(
      entrevistas => {
        if(entrevistas.length > 0) {
          //TODO: Fichero de logs
          console.log("SERVIDOR - Entrevistas: " + entrevistas.length);
          this.entrevistas = entrevistas
          this.entrevistasDisponibles = true;
        } else {
          // TODO: Fichero del logs
          this.entrevistasDisponibles = false;
          console.error("LOG getEntrevistas() (no hay más entrevistas por hacer)");
        }
      }
    );
  }

}
