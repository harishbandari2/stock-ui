import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apps, Trade } from '@app/consts/api.consts';
import { BackendService } from '@app/services';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit, AfterViewInit {
  @ViewChild('toggleSearch', { static: false })
  toggleSearch!: ElementRef;
  @ViewChild('menuSearch', { static: false })
  menuSearch!: ElementRef;

  strategyId = '';
  isSearchOpen = false;
  // searchItem = '';
  strikes: any = [];
  stocks: any[] = [{ id: 'Type 2 or more characters', name: 'to start seraching', virtual: true }];
  dropdownSettings = {
    idField: 'id',
    textField: 'name'
  };
  isSearchDisable = false;

  brokerSettings = {
    idField: 'id',
    textField: 'name',
    singleSelection: true
  };
  connections: any = [];
  modelChanged: Subject<string> = new Subject<string>();

  strategy: any = {
    name: null,
    type: 'POSITIONAL',
    overallStoploss: null,
    overallTarget: null,
    orderStoploss: null,
    orderTarget: null,
    margin: 100000,
    maxpositions: 8,
    maxopendays: null,
    sltoCost: false,
    status: 'DISABLED',
    brokers: [],
    enable: false
  };

  position: any = {
    exchange: 'NSE',
    quantity: 1,
    orderType: 'LIMIT',
    orderSide: 'BUY',
    symbol: '',
    code: '',
    price: 0,
    stoploss: {
      type: null,
      value: null
    },
    target: {
      type: null,
      value: null
    },
    tsl: {
      type: null,
      valuex: null,
      valuey: null
    },
    reentry: {
      type: null,
      value: null
    },
    status: 'Open'
  };

  orderLegs: any = [];
  listenerFn: () => void;

  constructor(
    private renderer: Renderer2,
    private backendService: BackendService,
    private route: ActivatedRoute,
    private toast: ToastrService
  ) {
    this.route.params.subscribe(params => {
      this.strategyId = params['id'];
      console.log(params, this.strategyId);
    });

    this.modelChanged.pipe(debounceTime(500)).subscribe(key => {
      if (key) this.searchCall(key);
    });
  }

  ngOnInit() {
    if (this.strategyId) this.getStartegy(this.strategyId);
    this.getConnections();

    this.connections = [
      {
        id: 'paper',
        name: 'Paper'
      }
    ];
  }

  async getStartegy(appName: String) {
    const strategy: any = await this.backendService.getService(Trade.strategy, appName).toPromise();
    // console.log(strategy);
    this.strategy = strategy.data;
    this.orderLegs = _.cloneDeep(this.strategy.positions || []);
  }

  async getConnections() {
    const connections: any = await this.backendService.postService(Apps.connections).toPromise();
    // console.log(connections);
    this.connections = [...this.connections, ...connections.data];
  }

  async addPosition(position: any) {
    const leg: any = _.cloneDeep(position);
    let scripInfo: any = await this.backendService.getService(Trade.ltp, leg.symbol).toPromise();
    console.log(scripInfo);

    leg.price = scripInfo.data.LastTradedPrice;
    leg.code = scripInfo.data.ScripCode;
    console.log(leg);

    const order = this.prepareOrder(leg); // console.log(ltp);

    this.orderLegs.push(order);
    setTimeout(() => {
      this.isSearchDisable = false;
      this.position.symbol = '';
    }, 100);
  }

  prepareOrder(order: any) {
    const { margin, maxpositions, orderStoploss, orderTarget, type } = this.strategy;
    const orderMargin = margin / maxpositions;
    console.log(margin, orderMargin);

    const qty = Math.floor(orderMargin / order.price);
    order.quantity = qty;
    order.type = type;
    order.stoploss = {
      type: 'percent',
      value: orderStoploss
    };
    order.target = {
      type: orderTarget ? 'percent' : null,
      value: orderTarget ? orderTarget : null
    };
    return order;
  }

  deleteOrder(i: number) {
    this.orderLegs.splice(i, 1);
  }

  updateStoploss(i: number) {
    this.orderLegs[i].stoploss.type = 'percent';
    this.orderLegs[i].stoploss.value = 25;
  }

  updateTarget(i: number) {
    this.orderLegs[i].target.type = 'percent';
    this.orderLegs[i].target.value = 25;
  }

  updateTrailStoploss(i: number) {
    if (this.orderLegs[i]['stoploss']['type']) {
      this.orderLegs[i].tsl.type = 'percent';
      this.orderLegs[i].tsl.valuex = 1;
      this.orderLegs[i].tsl.valuey = 1;
    }
  }

  copyLeg(order: any) {
    const cloneOrder = cloneDeep(order);
    this.orderLegs.push(cloneOrder);
  }

  updateReentry(i: number) {
    this.orderLegs[i].reentry.type = 'RECOST';
  }

  clickSearch() {
    if (this.isSearchDisable) return;
    this.position.symbol = '';
    this.modelChanged.next('');
    this.isSearchOpen = true;
    this.stocks = [{ ticker: 'Type 3 or more characters', name: 'to start seraching', virtual: true }];
  }

  changeSearch(e: any) {
    if (e.length > 2) {
      this.modelChanged.next(e);
    } else this.stocks = [{ ticker: 'Type 3 or more characters', name: 'to start seraching', virtual: true }];
  }

  async searchCall(e: string) {
    console.log(e);
    const scrips: any = await this.backendService.getService(Trade.scrip, e).toPromise();
    console.log(scrips);
    this.stocks = scrips.data;

    // let url = `http://localhost:3000/scrips/scrip/${e}`
    // this.http.get(url).subscribe((res: any) => {
    //   this.stocks = res.data;
    this.stocks = this.stocks.map(el => {
      return { ticker: el.symbol, name: el.company };
    });
    // });
  }

  async stockSelected(stock: any) {
    if (stock.virtual) return;
    console.log(stock);
    this.isSearchOpen = false;
    this.isSearchDisable = true;
    this.position.symbol = stock.ticker;
  }

  addSL(type: string, index: number) {
    this.orderLegs[index]['stoploss']['type'] = type;
  }
  removeSL(index: number) {
    this.orderLegs[index]['stoploss']['type'] = null;
    this.orderLegs[index]['stoploss']['value'] = null;
    this.removeTSL(index);
  }

  addTSL(type: string, index: number) {
    this.orderLegs[index]['tsl']['type'] = type;
  }
  removeTSL(index: number) {
    this.orderLegs[index]['tsl']['type'] = null;
    this.orderLegs[index]['tsl']['valuex'] = null;
    this.orderLegs[index]['tsl']['valuey'] = null;
  }

  addTG(type: string, index: number) {
    this.orderLegs[index]['target']['type'] = type;
  }
  removeTG(index: number) {
    this.orderLegs[index]['target']['type'] = null;
    this.orderLegs[index]['target']['value'] = null;
  }

  addReEntry(type: string, index: number) {
    this.orderLegs[index]['reentry']['type'] = type;
  }

  removeRE(index: number) {
    this.orderLegs[index]['reentry']['type'] = null;
    this.orderLegs[index]['reentry']['value'] = null;
  }

  changeType(id: any) {
    console.log(id);
    if (id == 'POSITIONAL') {
      this.strategy.type = 'POSITIONAL';
    } else {
      this.strategy.type = 'INTRADAY';
    }
  }

  saveStrategy() {
    if (!this.strategy.orderStoploss || !this.strategy.margin || !this.strategy.maxpositions) {
      this.toast.error('Please  fill required details');
      return;
    }
    // this.strategy.positions = this.orderLegs;
    console.log(this.strategy);
    this.backendService.postService(Trade.strategy, this.strategy).subscribe(
      (res: any) => {
        this.toast.success(`${this.strategy.name} Created Succesfully`);
        console.log('Saved', res.data);
        const data = res.data;
        if (data) this.strategyId = data._id;
      },
      err => {
        this.toast.error(err.error.message);
      }
    );
  }

  updateStrategy() {
    if (!this.strategy.orderStoploss || !this.strategy.margin || !this.strategy.maxpositions) {
      this.toast.error('Please  fill required details');
      return;
    }
    // console.log(this.strategy, this.orderLegs);
    // this.strategy.positions = this.orderLegs;
    this.backendService.putService(Trade.strategy, this.strategy).subscribe((res: any) => {
      this.toast.success(`${this.strategy.name} Updated Succesfully`);
      console.log('Updated');
    });
  }

  saveOrder(order: any) {
    console.log(order);

    order.strategyId = this.strategyId;
    //////save order///
    this.backendService.postService(Trade.order, order).subscribe(
      (res: any) => {
        if (res.succes) {
          this.toast.success(`Order Created Succesfully`);
          console.log('Saved', res.data);
          const data = res.data;
          order._id = data._id;
          // this.orderLegs.push(order);
        }
      },
      err => {
        this.toast.error(err.error.message);
      }
    );
  }

  modifyOrder(order: any) {
    //////modify order///
  }

  ngAfterViewInit() {
    this.listenerFn = this.renderer.listen('window', 'click', (e: Event) => {
      /**
       * Only run when toggleButton is not clicked
       * If we don't check this, all clicks (even on the toggle button) gets into this
       * section which in the result we might never see the menu open!
       * And the menu itself is checked here, and it's where we check just outside of
       * the menu and button the condition abbove must close the menu
       */
      if (
        this.toggleSearch &&
        !this.toggleSearch.nativeElement.contains(e.target) &&
        this.menuSearch &&
        !this.menuSearch.nativeElement.contains(e.target)
      ) {
        this.isSearchOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.listenerFn) {
      this.listenerFn();
    }
  }
}
