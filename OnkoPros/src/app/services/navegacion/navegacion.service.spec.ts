import { TestBed } from '@angular/core/testing';

import { NavegacionService } from './navegacion.service';

describe('NavegacionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NavegacionService = TestBed.get(NavegacionService);
    expect(service).toBeTruthy();
  });
});
