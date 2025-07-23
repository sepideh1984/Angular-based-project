import { TestBed } from '@angular/core/testing';

import { AirlineFindenService } from './sevices/airline-finden.service';

describe('AirlineFindenService', () => {
  let service: AirlineFindenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirlineFindenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
