import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router'
import { switchMap } from 'rxjs/operators'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  single: boolean;

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.single = this.route.snapshot.params['bool'] === "single";
  }

}
