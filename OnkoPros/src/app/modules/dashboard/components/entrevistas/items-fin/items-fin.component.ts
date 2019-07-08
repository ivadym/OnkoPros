import { Component, OnInit } from '@angular/core';
import { CompartirService } from '../../../../../services/compartir/compartir.service';

@Component({
  selector: 'app-items-fin',
  templateUrl: './items-fin.component.html',
  styleUrls: ['./items-fin.component.css']
})
export class ItemsFinComponent implements OnInit {
  
  nEntrevistas: string = "";
  
  constructor(
    private compartirService: CompartirService
  ) { }
  
  ngOnInit() {
    this.compartirService.changeEmitted$.subscribe(data => {
      this.nEntrevistas = data;
    });
  }

}
