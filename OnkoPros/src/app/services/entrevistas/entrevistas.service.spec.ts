import { TestBed } from '@angular/core/testing';

import { EntrevistasService } from './entrevistas.service';

describe('EntrevistasService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EntrevistasService = TestBed.get(EntrevistasService);
    expect(service).toBeTruthy();
  });
});
