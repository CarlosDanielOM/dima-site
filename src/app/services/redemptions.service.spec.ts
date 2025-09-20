import { TestBed } from '@angular/core/testing';

import { RedemptionsService } from './redemptions.service';

describe('RedemptionsService', () => {
  let service: RedemptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RedemptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
