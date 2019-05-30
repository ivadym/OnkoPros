import { Component, OnInit } from '@angular/core';

import { Usuario } from '../../../../classes/usuario';

import { AuthService } from '../../../../services/auth/auth.service';
import { LoggerService } from '../../../../services/logger/logger.service.tns';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent implements OnInit {

  usuarioLogueado: Usuario;

  constructor(
    private authService : AuthService,
    private logger : LoggerService
  ) {
    this.usuarioLogueado = this.authService.usuarioLogueado;
  }

  ngOnInit() { }

  // ENTREVISTAS REALIZADAS

  public historialOptions:any = {
    scaleShowVerticalLines: true,
    responsive: true
  };
  public historialLabels:string[] = ['Jul.', 'Ago.', 'Sept.', 'Oct.', 'Nov.', 'Dic.', 'Ene.'];
  public historialType:string = 'bar';
  public historialLegend:boolean = true;
 
  public historialData:any[] = [
    {data: [5, 4, 8, 8, 4, 9, 3], label: 'Tratamiento'},
    {data: [3, 4, 4, 7, 3, 5, 7], label: 'Calidad de vida'}
  ];
 
  public historialClicked(e: any):void {
    this.logger.log(e);
  }
 
  public historialHovered(e: any):void {
    this.logger.log(e);
  }
 
  public cambiarGrafica():void {
    this.historialType = this.historialType === 'bar' ? 'line' : 'bar';
  }

  public historialColors:Array<any> = [
    { 
      borderColor: 'rgba(255, 166, 0, 0.8)',
      backgroundColor: 'rgba(255, 166, 0, 0.5)',
      pointBorderColor: 'rgba(255, 166, 0, 1)',
      pointBackgroundColor: 'rgba(255, 166, 0, 1)',
      pointHoverBorderColor: 'rgba(255, 166, 0, 1)',
      pointHoverBackgroundColor: 'white'
    },
    {
      borderColor: 'rgba(43, 0, 128, 0.8)',
      backgroundColor: 'rgba(43, 0, 128, 0.5)',
      pointBorderColor: 'rgba(43, 0, 128,  1)',
      pointBackgroundColor: 'rgba(43, 0, 128, 1)',
      pointHoverBorderColor: 'rgba(43, 0, 128, 1)',
      pointHoverBackgroundColor: 'white'
    }
  ];

  //  PREGUNTAS RESPONDIDAS
 
  public preguntasLabels:string[] = ['Estado físico', 'Estado psícológico', 'Otros'];
  public preguntasData:number[] = [20, 50, 10];

  public preguntasType:string = 'pie';

  public preguntasColors: Array < any > = [{
    backgroundColor: [
      'rgba(255, 166, 0, 0.5)',
      'rgba(43, 0, 128, 0.5)',
      'rgba(148, 159, 177, 0.5)'
    ],
    borderColor: [
      'rgba(255, 166, 0, 1)',
      'rgba(43, 0, 128, 1)',
      'rgba(148, 159, 177, 1)'
    ]
  }];

  public preguntasClicked(e: any):void {
    this.logger.log(e);
  }
 
  public preguntasHovered(e: any):void {
    this.logger.log(e);
  }
  
  public randomize():void {
    let data = [
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100)
    ];
    let clone = JSON.parse(JSON.stringify(this.preguntasData));
    clone = data;
    this.preguntasData = clone;
  }

  // SÍNTOMAS

  public sintomasLabels:string[] = ['Náuseas', 'Fiebre', 'Cansancio', 'Sangrado', 'Dolor'];
 
  public sintomasData:any = [
    {data: [65, 59, 90, 81, 56], label: 'Mes actual'},
    {data: [28, 48, 40, 19, 96], label: 'Mes anterior'}
  ];
  public sintomasType:string = 'radar';

  public sintomasColors: Array<any> = [
    { 
      borderColor: 'rgba(255, 166, 0, 0.8)',
      backgroundColor: 'rgba(255, 166, 0, 0.5)',
      pointBorderColor: 'rgba(255, 166, 0, 1)',
      pointBackgroundColor: 'rgba(255, 166, 0, 1)',
      pointHoverBorderColor: 'rgba(255, 166, 0, 1)',
      pointHoverBackgroundColor: 'white'
    },
    {
      borderColor: 'rgba(43, 0, 128, 0.8)',
      backgroundColor: 'rgba(43, 0, 128, 0.5)',
      pointBorderColor: 'rgba(43, 0, 128,  1)',
      pointBackgroundColor: 'rgba(43, 0, 128, 1)',
      pointHoverBorderColor: 'rgba(43, 0, 128, 1)',
      pointHoverBackgroundColor: 'white'
    }
  ];
 
  public sintomasClicked(e: any):void {
    this.logger.log(e);
  }
 
  public sintomasHovered(e: any):void {
    this.logger.log(e);
  }
  
  public randomize_2():void {
    let data_1 = [
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
    ];
    let data_2 = [
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
      Math.round(Math.random() * 100),
    ];
    let clone = JSON.parse(JSON.stringify(this.sintomasData));
    clone[0].data = data_1;
    clone[1].data = data_2;
    this.sintomasData = clone;
  }

}
