import { TestBed } from '@angular/core/testing';

import { HistorialhttpServices } from './historial-https.services';

describe('HistorialhttpServices', () => {
  let service: HistorialhttpServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HistorialhttpServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
