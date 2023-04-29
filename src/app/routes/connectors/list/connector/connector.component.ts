import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Apps } from '@app/consts/api.consts';
import { BackendService } from '@app/services';

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss']
})
export class ConnectorComponent implements OnInit, OnDestroy {
  componentList: any = [];
  subscription: Subscription[] = [];

  constructor(private backendService: BackendService) {}

  ngOnInit() {
    let data = this.backendService.getService(Apps.applications).subscribe((res: any) => {
      this.componentList = res.data;
    });
    this.subscription.push(data);
  }

  ngOnDestroy() {
    this.subscription.forEach(sub => sub.unsubscribe());
  }
}
