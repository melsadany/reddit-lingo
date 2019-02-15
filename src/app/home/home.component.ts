import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StateManagerService } from '../services/state-manager.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  single: boolean;

  constructor(
    private stateManager: StateManagerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // KRM: Not how we want to do single assessment
    this.single = this.route.snapshot.params['bool'] === 'single';
  }
}
