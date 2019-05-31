import { Component, OnInit } from '@angular/core';
import { Message } from "nativescript-plugin-firebase/messaging";

import { LoggerService } from './services/logger/logger.service.tns';

const firebase = require("nativescript-plugin-firebase");

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(
    private logger: LoggerService
  ) { }

  ngOnInit() {
    firebase.init({
      // TODO
      onPushTokenReceivedCallback: (token: string) => {
        this.logger.log('Firebase token recibido: ' + token);
      }
    }).then(
      () => {
        // TODO
        this.logger.log('Firebase iniciado');
      },
      (error: string) => {
        // TODO
        this.logger.error('')
        console.error("ERROR Firebase init: " + error)
      }
    );
  }

}
