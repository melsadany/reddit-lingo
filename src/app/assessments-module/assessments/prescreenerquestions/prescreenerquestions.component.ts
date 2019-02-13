import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { FormBuilder, Validators } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';

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
    'I have never had any formal training in any kind of music',
    "I have some musical traning but don't routinely play or sing",
    'I can play an instrument, or have formal training in singing',
    'I play or sing professionally / I study music as a major / I teach music'
  ];

  constructor(
    private stateManager: StateManagerService,
    private dataService: AssessmentDataService,
    private fb: FormBuilder,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.stateManager.isInAssessment = true;
  }

  postData(): void {
    const data = {
      date: this.dataForm.get('date').value,
      gender: this.dataForm.get('gender').value,
      ethnicity: this.dataForm.get('ethnicity').value,
      education: this.dataForm.get('education').value,
      englishOption: this.dataForm.get('englishOption').value,
      musicAbility: this.dataForm.get('musicAbility').value
    };
    this.dataService
      .postAssessmentDataToMongo(
        {
          assess_name: 'prescreenerquestions',
          data: { prescreenerQuestions: data },
          completed: true
        },
        {
          assess_name: 'prescreenerquestions',
          data: {
            text: 'None'
          }
        }
      )
      .subscribe(); // KRM: Do this for every assessment
    // this.dataService.setData();
    this.stateManager.finishThisAssessmentAndAdvance('prescreenerquestions');
  }

  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
