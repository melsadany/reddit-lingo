import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { routerNgProbeToken } from '@angular/router/src/router_module';
import { StateManagerService } from '../services/state-manager.service';

@Component({
  selector: 'app-hashkeyinitialize',
  templateUrl: './hashkeyinitialize.component.html',
  styleUrls: ['./hashkeyinitialize.component.scss']
})
export class HashkeyinitializeComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private routerServie: Router,
    private stateManager: StateManagerService
  ) {
    const userHashKey = this.route.snapshot.paramMap.get('hashKey');
    console.log('User hashkey', userHashKey);
    this.stateManager.hashKey = userHashKey;
    this.routerServie.navigate(['home']);
  }

  ngOnInit(): void {}
}
