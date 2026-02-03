import { TestBed } from '@angular/core/testing';
import { CanMatchFn } from '@angular/router';

import { guestOnlyGuard } from './guest-only.guard';

describe('guestOnlyGuard', () => {
  const executeGuard: CanMatchFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => guestOnlyGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
