import { Component, Input } from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';
import { AudioRecordingService } from '../services/audio-recording.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService
  ) { 
    this.audioRecordingService.openNow.subscribe(value => {if(value){this.showRecordError=true;}})
  }
  public showRecordError=false

  public newWindow(){
    window.open('/','_blank')
    try{window.close()}catch{(e)=>{console.log("wow")}}
  }
  
  public updateHeader(): Boolean {
    if (this.stateManager.isInAssessment) {
      return true;
    } else {
      return false;
    }
  }
}
