import { TestBed } from '@angular/core/testing';

import { CuadroDialogoService } from './cuadro-dialogo.service';

describe('CuadroDialogoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CuadroDialogoService = TestBed.get(CuadroDialogoService);
    expect(service).toBeTruthy();
  });
});
