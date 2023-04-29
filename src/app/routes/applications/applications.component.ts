import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppContextService, BackendService } from '@app/services';
import { Apps } from '@app/consts/api.consts';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-applications',
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.scss']
})
export class ApplicationsComponent implements OnInit, OnDestroy {
  componentList: any = [];
  subscription: Subscription[] = [];

  appForm: FormGroup;
  licenseTypes = ['Free', 'Premium'];

  permissions: any = [];

  constructor(
    private backendService: BackendService,
    private modal: NgbModal,
    private fb: FormBuilder,
    private context: AppContextService
  ) {
    this.createFrom();
  }

  ngOnInit() {
    let data = this.backendService.getService(Apps.applications).subscribe((res: any) => {
      this.componentList = res.data;
      this.permissions = this.context.permissions['applications'] || [];
    });
    this.subscription.push(data);
  }

  createFrom() {
    this.appForm = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      logo: [null, Validators.required],
      licenseType: [null, Validators.required]
    });
  }

  openModel(content: any) {
    this.modal.open(content, { backdrop: 'static' });
    this.appForm.reset();
    // this.activeNode = createNew[0];
  }

  closeModel() {
    this.modal.dismissAll();
  }

  deleteApp(e: Event, app: any) {
    e.preventDefault();
    console.log(app);
    let api = this.backendService.deleteService(Apps.applications, app._id).subscribe((res: any) => {
      this.componentList = this.componentList.filter((trade: any) => trade._id !== app._id);
    });
    this.subscription.push(api);
  }

  save(data: any) {
    this.closeModel();
    let api = this.backendService.postService(Apps.applications, data).subscribe((res: any) => {
      this.componentList = [...this.componentList, data];
    });
    this.subscription.push(api);
  }

  ngOnDestroy() {
    this.subscription.forEach(sub => sub.unsubscribe());
  }
}
