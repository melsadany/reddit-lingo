import { Component, Input } from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(
    public stateManager: StateManagerService,
  ) { }

  public updateHeader(): Boolean {
    if (this.stateManager.isInAssessment) {
      return true;
    } else {
      return false;
    }
  }
}
