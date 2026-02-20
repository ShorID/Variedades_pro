import { TestBed } from '@angular/core/testing';

import { CategoriesServices } from './categories.services';

describe('CategoriesServices', () => {
  let service: CategoriesServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoriesServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
