import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-items-fin',
  templateUrl: './items-fin.component.html',
  styleUrls: ['./items-fin.component.css']
})
export class ItemsFinComponent implements OnInit {
  
  @ViewChild("buttonRef") buttonRef;
  
  constructor() { }
  
  ngOnInit() { }
  
  ngAfterViewInit() {
    this.buttonRef ? this.buttonRef.focus() : null;
  }

}
