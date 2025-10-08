import { TestBed } from '@angular/core/testing';

import { BansService } from './bans.service';

describe('BansService', () => {
  let service: BansService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BansService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
