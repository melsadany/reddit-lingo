import { Component, OnInit } from '@angular/core';
import { StateManagerService } from '../../../services/state-manager.service';
import { AudioRecordingService } from '../../../services/audio-recording.service';

@Component({
  selector: 'app-diagnostics',
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.scss']
})
export class DiagnosticsComponent implements OnInit {
  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService
  ) {}

  ngOnInit(): void {}

  setStateAndStart(): void {
    console.log('Start');
  }
}
