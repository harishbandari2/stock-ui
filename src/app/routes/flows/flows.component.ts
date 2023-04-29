import { Component, OnInit, OnDestroy } from '@angular/core';
import { BackendService } from '@app/services';
import { Flow, Trade } from '@app/consts/api.consts';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { createNew } from '../../../assets/staticdata';

@Component({
  selector: 'app-flows',
  templateUrl: './flows.component.html',
  styleUrls: ['./flows.component.scss']
})
export class FlowsComponent implements OnInit, OnDestroy {
  flowList: any = [];
  flowForm: FormGroup;
  subscription: Subscription[] = [];
  public createNew = createNew;
  public activeNode: any = createNew[0];

  transactionTypes = ['Debit', 'Credit'];
  totalAmount: any = 0;

  constructor(private backendService: BackendService, private modal: NgbModal, private fb: FormBuilder) {
    this.createFrom();
  }

  ngOnInit() {
    this.getFlows();
  }

  createFrom() {
    this.flowForm = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      amount: [null, Validators.required],
      transactionType: [null, Validators.required]
    });
  }

  getFlows() {
    this.flowList = [
      {
        id: 1,
        name: 'Test Flow',
        description: 'Testing'
      }
    ];
    // let data = this.backendService.getService(Trade.trade).subscribe((res: any) => {
    //   this.flowList = res.data;

    // });
    // this.subscription.push(data);
  }

  openModel(content: any) {
    this.modal.open(content, { backdrop: 'static' });
    this.flowForm.reset();
    this.activeNode = createNew[0];
  }

  activeCard(card: any) {
    this.activeNode = card;
  }

  closeModel() {
    this.modal.dismissAll();
  }

  deleteFlow(id: number) {
    this.flowList.splice(id, 1);
  }

  suspendFlow(data: any) {
    data.deactive = !data.deactive;
  }

  deleteTrade(data: any, id: number) {
    let api = this.backendService.deleteService(Trade.trade, data._id).subscribe((res: any) => {
      this.flowList = this.flowList.filter((trade: any) => trade._id !== data._id);
      this.calculateAmount();
    });
    this.subscription.push(api);
  }

  save(data: any) {
    this.closeModel();
    let api = this.backendService.postService(Trade.trade, data).subscribe((res: any) => {
      this.flowList = [...this.flowList, data];
      this.calculateAmount();
    });
    this.subscription.push(api);
  }

  calculateAmount() {
    this.totalAmount = 0;
    this.flowList.forEach((acu: any) => {
      if (acu.transactionType === 'Credit') this.totalAmount = this.totalAmount + acu.amount;
      else this.totalAmount = this.totalAmount - acu.amount;
    });
  }

  ngOnDestroy() {
    this.subscription.forEach(sub => sub.unsubscribe());
  }
}
