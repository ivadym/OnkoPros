import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-cuadro-dialogo',
  templateUrl: './cuadro-dialogo.component.html',
  styleUrls: ['./cuadro-dialogo.component.css'],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .window-modal .modal-content {
      border-color: #4D2A7B;
      border-radius: 5px;
    }
    .backdrop-color {
      background-color: rgba(42, 54, 123, 0.2);
    }
  `]
})
export class CuadroDialogoComponent implements OnInit {

  mensaje_1: string;
  mensaje_2: string;
  perfiles: string[];
  alerta: boolean;

  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit() { }

}
