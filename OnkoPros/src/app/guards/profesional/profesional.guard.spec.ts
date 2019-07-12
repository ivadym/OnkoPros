import { TestBed, async, inject } from '@angular/core/testing';

import { ProfesionalGuard } from './profesional.guard';

describe('ProfesionalGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProfesionalGuard]
    });
  });

  it('should ...', inject([ProfesionalGuard], (guard: ProfesionalGuard) => {
    expect(guard).toBeTruthy();
  }));
});
