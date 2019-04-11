import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateManagerService } from './services/state-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private stateManager: StateManagerService) {}

  public ngOnInit(): void {
    if (navigator.userAgent.match('CriOS')) {
      // this.stateManager.chromeiOs = true;
    }
    if (!this.stateManager.startedByHandFromHome) {
      this.stateManager.goHome();
    }
    this.stateManager.isInAssessment = false;
    if (this.stateManager.finishedAllAssessments) {
      this.stateManager.navigateTo('done');
    }
  }

  ngOnDestroy(): void {}
}
