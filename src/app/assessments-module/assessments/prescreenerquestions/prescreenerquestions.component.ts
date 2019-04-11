import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { FormBuilder, Validators } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';
import { SelectionAssessment } from '../../../structures/SelectionAssessment';

@Component({
  selector: 'app-prescreenerquestions',
  templateUrl: './prescreenerquestions.component.html',
  styleUrls: ['./prescreenerquestions.component.scss']
})
export class PrescreenerquestionsComponent
  implements OnInit, CanComponentDeactivate {
  dataForm = this.fb.group({
    date: ['', Validators.required],
    gender: ['', Validators.required],
    ethnicity: ['', Validators.required],
    education: ['', Validators.required],
    englishOption: ['', Validators.required],
    musicAbility: ['', Validators.required]
  });
  genderOptions = ['Prefer not to say', 'Male', 'Female', 'Other'];
  ethnicityOptions = [
    'Prefer not to say',
    'American Indian/Alaska Native',
    'Asian',
    'Hispanic/Latino',
    'Native Hawaiian/Other Pacific Islander',
    'White'
  ];
  educationOptions = [
    'Did not graduate High School',
    'High School diploma or equivalent',
    'Some college',
    '2 year college degree',
    '4 year college degree',
    'Graduate college',
    'Post graducate'
  ];
  englishOptions = ['Yes', 'No'];
  musicAbilityOptions = [
    'No formal training in music',
    'Do not regularly practice',
    'Some training in singing/playing',
    'I study music as a major',
    'I teach music',
    'I play or sing professionally'
  ];
  startDate = new Date(1995, 0, 1);
  englishNotFirstLanguage;

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    private fb: FormBuilder,
    public dialogService: DialogService
  ) {
    this.stateManager.showOutsideAssessmentButton = false;
  }

  ngOnInit(): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted('prescreenerquestions');
    this.stateManager.isInAssessment = true;
    if (!this.stateManager.startedByHandFromHome) {
      this.stateManager.goHome();
    }
    console.log(this.stateManager.isInAssessment);
  }

  postData(): void {
    const selection_data = {
      date: this.dataForm.get('date').value,
      gender: this.dataForm.get('gender').value,
      ethnicity: this.dataForm.get('ethnicity').value,
      education: this.dataForm.get('education').value,
      englishOption: this.dataForm.get('englishOption').value,
      musicAbility: this.dataForm.get('musicAbility').value
    };
    if (selection_data.englishOption === 'No') {
      this.englishNotFirst();
    } else {
      this.dataService
        .postAssessmentDataToFileSystem(
          {
            assess_name: 'prescreenerquestions',
            data: { selection_data: selection_data },
            completed: true
          },
          {
            assess_name: 'prescreenerquestions',
            data: {
              text: 'None'
            }
          }
        )
        .subscribe();
      this.stateManager.finishThisAssessmentAndAdvance('prescreenerquestions');
    }
  }

  englishNotFirst(): void {
    this.stateManager.showAssessmentFrontPage = false;
    this.englishNotFirstLanguage = true;
  }

  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
