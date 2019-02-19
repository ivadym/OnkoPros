import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrevistasFinComponent } from './entrevistas-fin.component';

describe('EntrevistasFinComponent', () => {
  let component: EntrevistasFinComponent;
  let fixture: ComponentFixture<EntrevistasFinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntrevistasFinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrevistasFinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
