import { StateManagerService } from '../services/state-manager.service';
import { DialogService } from '../services/dialog.service';
import { CanComponentDeactivate } from '../guards/can-deactivate.guard';

export class BaseAssessment implements CanComponentDeactivate {
  assessmentName: string;
  countingDown = false;
  intervalCountdown: NodeJS.Timeout;
  timeLeft = 3;
  doneCountingDown = false;
  showExample = true;

  constructor(
    public stateManager: StateManagerService,
    public dialogService: DialogService
  ) {
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
