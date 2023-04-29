import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppContextService, BackendService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private context: AppContextService, private backendService: BackendService) {}

  ngOnInit() {
    this.context.fetchUserInfo();
    this.context.currentUser.subscribe((res: any) => {});
  }
}
