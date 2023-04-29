import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Trade } from '@app/consts/api.consts';
import { BackendService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { createNew } from '../../../assets/staticdata';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  basketList: any = [];
  algoList: any = [];
  selectedAlgos: any = [];
  flowForm: FormGroup;
  subscription: Subscription[] = [];
  pId: null;
  public createNew = createNew;
  public activeNode: any = createNew[0];

  dropdownSettings = {
    idField: '_id',
    textField: 'name'
  };

  constructor(
    private backendService: BackendService,
    private modal: NgbModal,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.createFrom();
  }

  ngOnInit() {
    this.getFlows();
  }

  createFrom(data?: any) {
    this.flowForm = this.fb.group({
      name: [data ? data.name : null, Validators.required],
      description: [data ? data.description : 'diversify', Validators.required],
      margin: [data ? data.margin : 175000, Validators.required],
      status: [data ? data.status : 'ENABLED', Validators.required],
      basket: []
    });
  }

  getFlows() {
    let data = this.backendService.getService(Trade.portfolio).subscribe((res: any) => {
      this.basketList = res.data;
    });
    this.subscription.push(data);
  }

  getAlgos() {
    let data = this.backendService.getService(Trade.strategy).subscribe((res: any) => {
      this.algoList = res.data;
    });
    this.subscription.push(data);
  }

  openModel(content: any, data?: any) {
    console.log(data);

    this.modal.open(content, { backdrop: 'static' });
    this.getAlgos();
    this.flowForm.reset();
    this.activeNode = createNew[0];
    this.createFrom(data);
    this.selectedAlgos = data ? data.basket : [];
  }

  activeCard(card: any) {
    console.log(card);

    if (card.name == 'Startegy') {
      this.closeModel();
      this.router.navigate(['/create']);
      return;
    }
    this.activeNode = card;
  }

  get positions() {
    return this.flowForm.controls['positions'] as FormArray;
  }
  closeModel() {
    this.modal.dismissAll();
  }

  // deleteBasket(id: number) {
  //   this.basketList.splice(id, 1);
  // }

  suspendFlow(strategy: any, data: any) {
    strategy.status = data == 'Paper' ? 'Deployed' : 'Paper';
    this.update(strategy, strategy._id);
  }

  editBasket(content: any, data: any) {
    this.pId = data._id;
    this.openModel(content, data);
  }

  deleteBasket(data: any, id: number) {
    let api = this.backendService.deleteService(Trade.portfolio, data._id).subscribe((res: any) => {
      this.basketList = this.basketList.filter((trade: any) => trade._id !== data._id);
      // this.calculateAmount();
    });
    this.subscription.push(api);
  }

  save(data: any) {
    this.closeModel();
    data.basket = this.selectedAlgos;
    console.log(data, this.selectedAlgos);

    let api = this.backendService.postService(Trade.portfolio, data).subscribe((res: any) => {
      this.basketList = [...this.basketList, res.data];
      // this.calculateAmount();
    });
    this.subscription.push(api);
  }

  update(data: any, id?: string) {
    // console.log(data,id);
    this.closeModel();
    data._id = id;
    data.basket = this.selectedAlgos;
    console.log(data, this.selectedAlgos);

    let item = this.backendService.putService(Trade.portfolio, data, data.id).subscribe((res: any) => {
      const index = this.basketList.findIndex((el: any) => el._id == id);
      this.basketList[index] = res.data;
    });
    this.subscription.push(item);
  }

  // calculateAmount() {
  //   this.totalAmount = 0;
  //   this.flowList.forEach((acu: any) => {
  //     if (acu.transactionType === 'Credit') this.totalAmount = this.totalAmount + acu.amount;
  //     else this.totalAmount = this.totalAmount - acu.amount;
  //   });
  // }

  ngOnDestroy() {
    this.subscription.forEach(sub => sub.unsubscribe());
  }
}
