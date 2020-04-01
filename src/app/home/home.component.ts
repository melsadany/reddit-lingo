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

  }
}
