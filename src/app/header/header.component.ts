import { Component ,ViewChild,HostListener,ElementRef,Renderer2} from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';
import { AudioRecordingService } from '../services/audio-recording.service';
import { AssessmentDataService } from '../services/assessment-data.service'
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('div') public div: ElementRef;
  @ViewChild('sideNavBlue') public sideNavBlue: ElementRef;
  constructor(
    public dataService: AssessmentDataService,
    private renderer: Renderer2,
    public stateManager: StateManagerService,
    public audioRecordingService: AudioRecordingService
  ) {
    if (this.stateManager.appConfig['appConfig']['kioskSettings']['kioskMode']){
    
      this.continueButton.className = "continueButton";
      this.continueButton.textContent = "I'm still here";
      this.continueButton.style.color = "white";
      this.continueButton.style.backgroundColor= "transparent";
      this.continueButton.style.border= "2px solid white";
      this.continueButton.style.paddingTop = "2px"
      
      this.span.textContent = "Still Here?   ("+this.countDown + ")   ";
   }
  }
  public showWarning=false;
  public countDownTime = this.stateManager.warningTime;
  public countDown = this.countDownTime;
  public leave : NodeJS.Timeout;
  public span: HTMLSpanElement = this.renderer.createElement('span');
  public continueButton: HTMLButtonElement = this.renderer.createElement('button');
  public beginLeave = setTimeout(() => { if (window.location.pathname != "/home" && this.stateManager.appConfig['appConfig']['kioskSettings']['kioskMode']) //don't change location 
    this.checkUserStillThere()}, this.stateManager.idleTime);
  //most of this code is used for 
  @HostListener('document:click', ['$event']) 

  //fires when user clicks anywhere
  public onClick() {
    if (this.stateManager.appConfig['appConfig']['kioskSettings']['kioskMode']){
      try{this.stopCountDown();}catch  (e) {if (e instanceof DOMException){}else{console.log(e)}} //
      this.countDown=this.countDownTime;this.span.textContent = "Still Here?  (" + this.countDown+ ")   ";
      clearTimeout(this.beginLeave); 
      clearInterval(this.leave)
      this.beginLeave = setTimeout(() => { if (window.location.pathname != "/home") 
        this.checkUserStillThere() }, this.stateManager.idleTime);
    }
  }

  public checkUserStillThere() {
    this.showWarning=true;
    this.sideNavBlue.nativeElement.style.display="";
    this.div.nativeElement.style.display = ""
    this.leave = setInterval(() => { this.countDownFunction()
      }, 1000);
    
    this.renderer.appendChild(this.div.nativeElement, this.span)
    this.renderer.appendChild(this.div.nativeElement, this.continueButton)
  }

  public countDownFunction (){
    if (this.countDown==0){
      this.endAssessment()
    }
    else{
      this.countDown--;
      this.span.textContent = "Still Here?  (" + this.countDown+ ")   ";
    }
  }
  public endAssessment(){
      clearInterval(this.leave);
      this.countDown=this.countDownTime;
      this.dataService.deleteHashKeyCookie();
      this.dataService.deleteUserIdCookie();
      window.location.assign('/');
  }
  public stopCountDown() : void{
    this.showWarning=false;
    this.div.nativeElement.removeChild(this.continueButton);
    this.div.nativeElement.removeChild(this.span);
    this.div.nativeElement.style.display = "none";
    this.sideNavBlue.nativeElement.style.display="none";
  }

  public updateHeader(): Boolean {
    if (this.stateManager.isInAssessment) {
      return true;
    } else {
      return false;
    }
  }
}
