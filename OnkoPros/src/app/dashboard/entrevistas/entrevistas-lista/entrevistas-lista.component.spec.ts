import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrevistasListaComponent } from './entrevistas-lista.component';

describe('EntrevistasListaComponent', () => {
  let component: EntrevistasListaComponent;
  let fixture: ComponentFixture<EntrevistasListaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntrevistasListaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrevistasListaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
