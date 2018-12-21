import { TestBed } from '@angular/core/testing';

import { AssessmentsService } from './assessments.service';

describe('AssessmentsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AssessmentsService = TestBed.get(AssessmentsService);
    expect(service).toBeTruthy();
  });
});
