import { Component, OnInit } from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';
import { AssessmentDataService } from '../services/assessment-data.service';
import { HashkeyinitializeComponent } from '../hashkeyinitialize/hashkeyinitialize.component'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(public stateManager: StateManagerService, public dataService: AssessmentDataService) { }
  // KRM: Need this injection for the template
  public showHashError=false;
  ngOnInit(): void {
    if (this.stateManager.hashKey && this.dataService.checkHashKeyCooke()) {
      console.log('hk set');
    } else if (
      !this.stateManager.hashKey &&
      !this.dataService.checkHashKeyCooke()
    ) {
      console.log('no hk');
      if(this.stateManager.hashkeyAsGUID)this.showHashError=true;
      else this.dataService.initializeData();
    } else if (
      !this.stateManager.hashKey &&
      this.dataService.checkHashKeyCooke()
    ) {
      console.log('hk cached');
      this.stateManager.goToHashKeyInitializer(
        this.dataService.getHashKeyCookie()
      );
    }
    
    this.stateManager.isInAssessment = false;

    //checks to see if MTurk is enabled and if it is
    //it kicks user to 'done' page
   if (this.stateManager.appConfig['appConfig']['settings']['MTurkEnabled']){
     if(!this.dataService.getAssignmentId()){ 
      console.log("didn't find assignmentID cookie") 
      this.stateManager.configureMTurk(); 
       this.dataService.setAssignmentId(this.stateManager.MTurkAssignmentId)}
    else{
      this.stateManager.MTurkAssignmentId=this.dataService.getAssignmentId()
    }
    console.log("in home.component and state.assignmentID = ", this.stateManager.MTurkAssignmentId)
    setTimeout(function () { console.log( "Times up."); 
    if (window.location.pathname != "/assessments/done"){
      window.location.assign('assessments/done');}
  },this.stateManager.appConfig['appConfig']['settings']['SetTimeoutTimeInMinutes']*1000*60)
    }
  if (this.stateManager.finishedAllAssessments) {
      this.stateManager.navigateTo('done');
    }
  }
}
