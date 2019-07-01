import { TestBed } from '@angular/core/testing';

import { CompartirService } from './compartir.service';

describe('CompartirService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CompartirService = TestBed.get(CompartirService);
    expect(service).toBeTruthy();
  });
});
