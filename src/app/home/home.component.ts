import { Component } from '@angular/core';
import { StateManagerService } from '../services/state-manager.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public stateManager: StateManagerService) { }
  // KRM: Need this injection for the template
}
