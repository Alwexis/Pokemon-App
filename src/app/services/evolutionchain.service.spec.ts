import { TestBed } from '@angular/core/testing';

import { EvolutionchainService } from './evolutionchain.service';

describe('EvolutionchainService', () => {
  let service: EvolutionchainService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvolutionchainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
