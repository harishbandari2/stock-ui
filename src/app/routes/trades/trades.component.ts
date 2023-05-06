import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Trade } from '@app/consts/api.consts';
import { AppContextService, BackendService, CommonApiService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { createNew } from '../../../assets/staticdata';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss']
})
export class TradesComponent implements OnInit {
  subscription: Subscription[] = [];
  trades: any = [];

  tradeIndex = {};
  flowForm: FormGroup;

  public createNew = createNew;
  public activeNode: any = createNew[0];

  ticks = [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500];
  strikes: any = [];

  appName: String = '';

  app: any = {};

  polling: any;

  tableState = {
    name: '',
    totalPnl: 0,
    totalCapital: 0,
    totalNetChange: 0,
    activeCount: 0,
    tradeStatus: false,
    bnf: 1
  };

  constructor(
    private backendService: BackendService,
    private toast: ToastrService,
    private modal: NgbModal,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private commonService: CommonApiService
  ) {
    this.route.params.subscribe(params => {
      this.appName = params['app'];
      this.createFrom();
    });
  }

  ngOnInit() {
    this.getStartegy(this.appName);
  }

  async getStartegy(appName: String) {
    const strategy: any = await this.backendService.getService(Trade.strategy, appName).toPromise();
    this.app = strategy.data;
    this.createFrom(this.app);
    // this.flowForm.patchValue(this.app)
    this.tableState.totalCapital = this.app.margin;
    this.getTrades();
  }

  getTrades() {
    let trades = this.commonService.trades.subscribe((trade: any) => {
      if (trade) {
        const trades = trade.filter((el: any) => el.strategyId == this.appName);
        this.trades = trades;
        this.computePL(this.trades);
        this.indexTrades(this.trades);
      }
    });
    this.subscription.push(trades);
  }

  indexTrades(trades: any) {
    this.tableState['activeCount'] = 0;
    for (const [i, v] of trades.entries()) {
      // this.tradeIndex[v.symbol]=i;
      if (v.status === 'Open') {
        this.tableState['activeCount'] = this.tableState['activeCount'] + 1;
      }
    }
    console.log(this.tableState['activeCount']);
  }

  computePL(trades: any) {
    this.tableState['totalPnl'] = 0;
    this.tableState['totalNetChange'] = 0;
    for (const trade of trades) {
      if (trade.status == 'Open') {
        // else if(trade.closeReason == 'slHit')  trade.pnl = ((trade.buyAvg*-2)/100)*trade.quantity;
        if (trade.orderSide == 'SELL') {
          trade.pnl = parseFloat(((trade.avgEntryPrice - trade.ltp) * trade.quantity).toFixed(2));
        } else trade.pnl = parseFloat(((trade.ltp - trade.avgEntryPrice) * trade.quantity).toFixed(2));
      } else {
        if (trade.orderSide == 'SELL') {
          trade.pnl = parseFloat(((trade.avgEntryPrice - trade.avgExitPrice) * trade.quantity).toFixed(2));
        } else trade.pnl = parseFloat(((trade.ltp - trade.avgExitPrice) * trade.quantity).toFixed(2));
      }
      // trade.netchange = (
      //   ((trade.ltp - (trade.orderType == 'BUY' ? trade.buyAvg : trade.sellAvg)) /
      //     (trade.orderType == 'BUY' ? trade.buyAvg : trade.sellAvg)) *
      //   100
      // ).toFixed(2);

      this.tableState['totalPnl'] = parseFloat((this.tableState['totalPnl'] + trade.pnl).toFixed(2));
      this.tableState['totalNetChange'] = parseFloat(
        ((this.tableState['totalPnl'] / this.tableState['totalCapital']) * 100).toFixed(2)
      );
      // console.log(this.tableState['totalPnl']);
    }
  }

  postTrade() {
    const data = {
      stocks: 'NIFTY',
      trigger_prices: '3.75,541.8,2.1,0.2,329.6,166.8,1.25',
      triggered_at: '2:34 pm',
      scan_name: 'Short term breakouts',
      scan_url: 'short-term-breakouts',
      alert_name: 'PivotPoint',
      webhook_url: 'http://your-web-hook-url.com'
    };
    this.backendService.postService(Trade.trade, data).subscribe((res: any) => {
      console.log(data);
    });
  }

  changeTrade(data: boolean) {
    console.log(data);
    this.backendService.postService(Trade.start, { status: data, stocks: 'WIPRO' }).subscribe((res: any) => {
      console.log(data);
    });
  }

  //// create Position
  createFrom(data?: any) {
    // console.log(data);

    this.flowForm = this.fb.group({
      name: [data ? data.name : null, Validators.required],
      segment: [data ? data.segment : 'fno', Validators.required],
      type: [data ? data.type : 'simple', [Validators.required]],
      startTime: [data ? data.startTime : 915, Validators.required],
      endTime: [data ? data.endTime : 1455, Validators.required],
      stopLoss: [data ? data.stopLoss : 2, Validators.required],
      target: [data ? data.target : 2, Validators.required],
      numbersIn: ['percent', Validators.required],
      margin: [data ? data.margin : 175000, Validators.required],
      multiplier: [data ? data.multiplier : 1, Validators.required],
      status: [data ? data.status : 'Paper', Validators.required],
      positions: this.fb.array([])
    });
  }

  openModel(content: any) {
    this.modal.open(content, { backdrop: 'static' });
    // this.flowForm.reset();
    this.activeNode = createNew[0];
    this.changeStock('BANKNIFTY');
    this.createFrom(this.app);
  }

  activeCard(card: any) {
    this.activeNode = card;
  }

  get positions() {
    return this.flowForm.controls['positions'] as FormArray;
  }

  addPosition(type: string) {
    console.log(type);
    if (type == 'fno') {
      const fnoForm = this.fb.group({
        stock: ['BANKNIFTY', Validators.required],
        quantity: [25, Validators.required],
        strike: [0, Validators.required],
        orderType: ['SELL', Validators.required],
        orderSide: ['CE', Validators.required],
        stopLoss: [20, Validators.required]
      });
      this.positions.push(fnoForm);
    } else {
      const cashForm = this.fb.group({
        stock: ['', Validators.required],
        quantity: [1, Validators.required],
        orderType: ['BUY', Validators.required],
        triggerPrice: [1, Validators.required],
        price: [1, Validators.required],
        stopLoss: [0, Validators.required],
        target: [1, Validators.required]
      });
      this.positions.push(cashForm);
    }
  }

  removePosition(index: number) {
    let control = this.flowForm.get('positions') as FormArray;
    control.removeAt(index);
  }

  deletePosition(lessonIndex: number) {
    this.positions.removeAt(lessonIndex);
  }

  closeModel() {
    this.modal.dismissAll();
    this.flowForm.reset();
  }

  changeStock(stock: any) {
    this.strikes = [];
    if (stock.includes('BANKNIFTY')) {
      this.strikes = this.ticks;
    } else this.strikes = this.ticks.map((el: any) => el / 2);
  }

  exitPosition(trade: any) {
    console.log(trade);
    let body = this.app;
    body.position = trade;
    let api = this.backendService.postService(Trade.exitPosition, body).subscribe(
      (res: any) => {
        this.toast.success('Exit trade signal Sent');
      },
      err => {
        this.toast.error('Failed to Exit trade');
      }
    );
  }

  terminateAlgo(app: any) {
    console.log(app);

    let api = this.backendService.postService(Trade.terminate, { id: app._id }).subscribe(
      (res: any) => {
        this.toast.success('Exit trade signal Sent');
      },
      err => {
        this.toast.error('Failed to Exit trade');
      }
    );
  }

  identify(index: any, trade: any) {
    return trade.uid;
  }

  save(data: any) {
    this.closeModel();
    console.log(data);

    let api = this.backendService.postService(Trade.trade, data).subscribe((res: any) => {
      // this.calculateAmount();
    });
    // this.subscription.push(api);
  }

  ngOnDestroy() {
    this.subscription.forEach(el => el.unsubscribe());
  }
}
