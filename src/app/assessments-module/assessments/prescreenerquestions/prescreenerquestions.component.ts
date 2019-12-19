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
    this.stateManager.sendToCurrentIfAlreadyCompleted(this.assessmentName);
    this.stateManager.isInAssessment = true;
    this.dataForm = this.fb.group({
      firstName: [
        '',
        Validators.required
      ],
      lastName: ['', Validators.required],
      id: ['', Validators.required],

    });
    /*this.dataForm.addControl(
      'majorOfStudy',
      new FormControl()
    );
    this.dataForm
      .get('currentOccupation')
      .valueChanges.subscribe(occupation => {
        if (occupation === 'Student (specify major)') {
          this.dataForm
            .get('majorOfStudy')
            .setValidators([Validators.required]);
        }
      });
      */
  }

  postData(): void {
    const selection_data = {
      firstName: this.dataForm.get('firstName').value,
      lastName: this.dataForm.get('lastName').value,
      id: this.dataForm.get('id').value,
     
    };
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
  }

  englishNotFirst(): void {
    this.stateManager.showAssessmentFrontPage = false;
  }
}
