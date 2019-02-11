import { Component, OnInit, OnDestroy } from '@angular/core';
import { AssessmentDataService } from '../../../services/assessment-data.service';
import { FormBuilder, Validators } from '@angular/forms';
import { DialogService } from '../../../services/dialog.service';
import { CanComponentDeactivate } from '../../../guards/can-deactivate.guard';
import { StateManagerService } from '../../../services/state-manager.service';

@Component({
  selector: 'app-postscreenerquestions',
  templateUrl: './postscreenerquestions.component.html',
  styleUrls: ['./postscreenerquestions.component.scss']
})
export class PostscreenerquestionsComponent
  implements OnInit, CanComponentDeactivate {
  dataForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    cityOfBirth: ['', Validators.required],
    stateOfBirthOption: ['', Validators.required],
    publicSchoolOption: ['', Validators.required]
  });

  stateOfBirthOptions = [
    'Alabama',
    'Alaska',
    'American Samoa',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'District of Columbia',
    'Federated States of Micronesia',
    'Florida',
    'Georgia',
    'Guam',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Marshall Islands',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Northern Mariana Islands',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Palau',
    'Pennsylvania',
    'Puerto Rico',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virgin Island',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming'
  ];

  publicSchoolOptions = [
    'Elementary school (all or partial)',
    'Middle school/Jr. High (all or partial)',
    'High school(all or partial)'
  ];

  constructor(
    private dataService: AssessmentDataService,
    private fb: FormBuilder,
    private dialogService: DialogService,
    private stateManager: StateManagerService
  ) {}

  ngOnInit(): void {
    this.stateManager.isInAssessment = true;
    this.stateManager.showAssessmentFrontPage = true;
  }

  postData(): void {
    const data = {
      name: this.dataForm.get('name').value,
      email: this.dataForm.get('email').value,
      cityOfBirth: this.dataForm.get('cityOfBirth').value,
      stateOfBirthOption: this.dataForm.get('stateOfBirthOption').value,
      publicSchoolOption: this.dataForm.get('publicSchoolOption').value
    };
    this.dataService
      .postAssessmentDataToMongo(
        {
          assess_name: 'postscreenerquestions',
          data: { prescreenerQuestions: data },
          completed: true
        },
        {
          assess_name: 'postscreenerquestions',
          data: {
            text: 'None'
          }
        }
      )
      .subscribe(); // KRM: Do this for every assessment
    this.stateManager.finishThisAssessmentAndAdvance('postscreenerquestions');
  }
  canDeactivate(): boolean {
    return this.dialogService.canRedirect();
  }
}
