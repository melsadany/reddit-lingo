import { Component, OnInit } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import {
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
  FormGroup,
  FormControl
} from '@angular/forms';
import { StateManagerService } from '../../../services/state-manager.service';

@Component({
  selector: 'app-prescreenerquestions',
  templateUrl: './prescreenerquestions.component.html',
  styleUrls: ['./prescreenerquestions.component.scss']
})
export class PrescreenerquestionsComponent implements OnInit {
  assessmentName = 'prescreenerquestions';
  dataForm: FormGroup;
  genderOptions = [
    'Man',
    'Woman',
    'Non-binary/Genderqueer',
    'Agender',
    'Other (describe)',
    'Prefer not to say'
  ];
  raceOptions = [
    'White or Caucasian',
    'Hispanic or Latino',
    'Black or African American',
    'Native American or Alaskan Native',
    'Asian',
    'Native Hawaiian or Pacific Islander',
    'Not sure',
    'Prefer not to say',
    'Other (describe)'
  ];
  ethnicityOptions = [
    'Hispanic or Latino',
    'Not Hispanic or Latino',
    'Not sure',
    'Prefer not to say'
  ];
  educationOptions = [
    'Some high school',
    'High school degree',
    'Some college, no degree',
    'Associate degree',
    'Professional degree',
    // tslint:disable-next-line:quotemark
    "Bachelor's degree",
    // tslint:disable-next-line:quotemark
    "Master's degree",
    'Doctorate',
    'Not sure',
    'Prefer not to say'
  ];
  currentOccupationOptions = [
    'Agriculture/Natural Resources',
    'Student (specify major)',
    'Retail',
    'Manufacturing/Industrial',
    'Science/Research',
    'Communication/Media',
    'Healthcare',
    'Academia/Teaching',
    'Food Services',
    'Software/Technology',
    'Skilled Worker/Tradesman',
    'Sales',
    'Artist',
    'Writer',
    'Musician',
    'Government/Civil Service',
    'Law',
    'Other Service or Administration',
    'Other (please specify)'
  ];
  annualIncomeOptions = [
    'Less than $14,999',
    '$15,000-$24,999',
    '$25,000-$34,999',
    '$35,000-$49,999',
    '$50,000-$74,999',
    '$75,000-$99,999',
    '$100,000-$149,999',
    '$150,000-$199,999',
    'More than $200,000',
    'Prefer not to say'
  ];

  constructor(
    public stateManager: StateManagerService,
    public dataService: AssessmentDataService,
    private fb: FormBuilder
  ) {
    this.stateManager.showOutsideAssessmentButton = false;
  }

  numbersOnly(numberRegEx: RegExp): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden = numberRegEx.test(control.value);
      return forbidden ? null : { forbiddenValue: { value: control.value } };
    };
  }

  ifStudent(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const forbidden = this.isStudentOccupationAndEnteredMajor();
      return forbidden ? null : { forbiddenValue: { value: control.value } };
    };
  }

  isStudentOccupation(): boolean {
    return (
      this.dataForm.get('currentOccupation').value === 'Student (specify major)'
    );
  }

  isStudentOccupationAndEnteredMajor(): boolean {
    if (this.isStudentOccupation()) {
      if (
        this.dataForm.get('majorOfStudy').value === null ||
        this.dataForm.get('majorOfStudy').value === ''
      ) {
        return false;
      } else {
        return true;
      }
    }
  }

  ngOnInit(): void {
    this.stateManager.sendToCurrentIfAlreadyCompleted('prescreenerquestions');
    this.stateManager.isInAssessment = true;
    // if (!this.stateManager.startedByHandFromHome) {
    //   this.stateManager.goHome();
    // }
    this.dataForm = this.fb.group({
      currentAge: [
        '',
        [Validators.required, this.numbersOnly(/^\+?(0|[1-9]\d*)$/)]
      ],
      highestEducation: ['', Validators.required],
      currentOccupation: ['', Validators.required],
      annualIncome: ['', Validators.required],
      gender: ['', Validators.required],
      race: ['', Validators.required],
      ethnicity: ['', Validators.required]
    });
    this.dataForm.addControl(
      'majorOfStudy',
      new FormControl(null, this.ifStudent())
    );
  }

  postData(): void {
    const selection_data = {
      age: this.dataForm.get('currentAge').value,
      highestEducation: this.dataForm.get('highestEducation').value,
      currentOccupation: this.dataForm.get('currentOccupation').value,
      annualIncome: this.dataForm.get('annualIncome').value,
      gender: this.dataForm.get('gender').value,
      race: this.dataForm.get('race').value,
      ethnicity: this.dataForm.get('ethnicity').value
    };
    // if (selection_data.englishOption === 'No') {
    //   this.englishNotFirst();
    // } else {
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
    this.stateManager.finishThisAssessmentAndAdvance(this.assessmentName);
    // }
  }

  englishNotFirst(): void {
    this.stateManager.showAssessmentFrontPage = false;
    // this.englishNotFirstLanguage = true;
  }
}
