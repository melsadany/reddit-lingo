import { TestBed, inject } from '@angular/core/testing';

import { AudioRecordingService } from './audio-recording.service';

describe('AudioRecorderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AudioRecordingService]
    });
  });

  it('should be created', inject([AudioRecordingService], (service: AudioRecordingService) => {
    expect(service).toBeTruthy();
  }));
});
