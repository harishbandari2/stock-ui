import { Component, OnInit } from '@angular/core';
import { Metadata, Rbac } from '@app/consts/api.consts';
import { AppContextService, BackendService, CommonApiService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  plans: any;
  subscription: Subscription[] = [];
  checkedPlan: any = {};

  user: any = {};

  constructor(
    private appContext: AppContextService,
    private toast: ToastrService,
    private backendService: BackendService,
    private commonService: CommonApiService,
    private modal: NgbModal
  ) {
    this.appContext.currentUser.subscribe(el => {
      if (el) {
        this.user = el;
        const today = Date.now();
        if (el.account.validuntil < today) {
          this.user.account['status'] = 'Expired';
        } else this.user.account['status'] = 'Active';
      }
    });
  }

  ngOnInit() {
    this.getMetadata('subscriptions');
  }

  getMetadata(meta: string) {
    let data = this.backendService.getService(Metadata.meta, meta).subscribe((res: any) => {
      this.plans = res.data[0];
    });
    this.subscription.push(data);
  }

  openModel(content: any, plan: any) {
    this.modal.open(content, { backdrop: 'static' });
    this.checkedPlan = plan;
    // this.activeNode = createNew[0];
  }

  activatePlan(plan: any) {
    if (plan && plan.price < 1) {
      this.checkedPlan.price = 0;
      this.backendService.putService(Rbac.account, plan, this.user._id).subscribe((user: any) => {
        console.log(user);
        this.user.account = user.data[0];
        this.appContext.currentUser.next(this.user);
        this.toast.success('Account Upgraded');
      });
      // console.log(this.activePlan);
    } else {
      console.log('here');
      this.checkedPlan = plan;
    }
  }
}
