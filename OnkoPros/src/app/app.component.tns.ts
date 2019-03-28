import { Component, OnInit } from '@angular/core';
import { Message } from "nativescript-plugin-firebase/messaging";

const firebase = require("nativescript-plugin-firebase");

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    firebase.init({
      onPushTokenReceivedCallback: (token: string) => {
        console.log("LOG Firebase token recibido: " + token);
      }
    }).then(
      () => {
        console.log("LOG Firebase init")
      },
      (error: string) => {
        console.error("ERROR Firebase init: " + error)
      }
    );
  }

}
