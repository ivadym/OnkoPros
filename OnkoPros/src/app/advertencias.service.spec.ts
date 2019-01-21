import { TestBed } from '@angular/core/testing';

import { AdvertenciasService } from './advertencias.service';

describe('AdvertenciasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdvertenciasService = TestBed.get(AdvertenciasService);
    expect(service).toBeTruthy();
  });
});
