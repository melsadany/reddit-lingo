import { StateManagerService } from '../services/state-manager.service';
import { DialogService } from '../services/dialog.service';

export class BaseAssessment {
  assessmentName: string;
  countingDown = false;
  intervalCountdown: NodeJS.Timeout;
  timeLeft = 3;
  doneCountingDown = false;

  constructor(public stateManager: StateManagerService, public dialogService: DialogService) {
    this.stateManager.showOutsideAssessmentButton = false;
  }

  startDisplayedCountdownTimer(onCountdownEndCallback: Function): void {
    this.countingDown = true;
    this.intervalCountdown = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.timeLeft = 3;
        this.countingDown = false;
        this.doneCountingDown = true;
        onCountdownEndCallback();
        clearInterval(this.intervalCountdown);
      }
    }, 1000);
  }

  finishAssessment(): void {
    this.stateManager.finishThisAssessmentAndAdvance(this.assessmentName);
  }

  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }

}
