import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrevistasInstruccionesComponent } from './entrevistas-instrucciones.component';

describe('EntrevistasInstruccionesComponent', () => {
  let component: EntrevistasInstruccionesComponent;
  let fixture: ComponentFixture<EntrevistasInstruccionesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntrevistasInstruccionesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrevistasInstruccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
