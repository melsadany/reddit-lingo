import { TestBed, inject } from '@angular/core/testing';

import { AssessmentDataService } from './assessment-data.service';

describe('AssessmentDataService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AssessmentDataService]
    });
  });

  it('should be created', inject([AssessmentDataService], (service: AssessmentDataService) => {
    expect(service).toBeTruthy();
  }));
});
