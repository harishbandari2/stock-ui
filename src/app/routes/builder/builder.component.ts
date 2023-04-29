import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apps, Trade } from '@app/consts/api.consts';
import { BackendService } from '@app/services';
import * as _ from 'lodash';
import { cloneDeep } from 'lodash';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-builder',
  templateUrl: './builder.component.html',
  styleUrls: ['./builder.component.scss']
})
export class BuilderComponent implements OnInit {
  strategyId = '';

  strikes: any = [];
  index: any = ['NIFTY', 'BANKNIFTY', 'FINNIFTY'];
  dropdownSettings = {
    idField: 'id',
    textField: 'name'
  };

  brokerSettings = {
    idField: 'id',
    textField: 'name',
    singleSelection: true
  };

  days: any = [];
  connections: any = [];

  selectedDays: any = [];

  indexInfo = {
    lotSize: {
      BANKNIFTY: 25,
      NIFTY: 50,
      FINNIFTY: 40
    }
  };

  strategy: any = {
    name: null,
    startTime: 925,
    endTime: 1525,
    overallStoploss: null,
    overallTarget: null,
    multiplier: 1,
    margin: 175000,
    days: null,
    sltoCost: false,
    squareOffallLegs: false,
    reasapALL: false,
    reasapALLConfig: {
      repeatCount: 1,
      qmultiplier: 1,
      exitLastnthLegs: null
    },
    status: 'DISABLED',
    brokers: [],
    enable: false
  };

  position: any = {
    index: 'NIFTY',
    lot: 1,
    orderType: 'CE',
    strike: {
      type: 'SPOT',
      value: 0
    },
    orderSide: 'SELL',
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
    }
  };

  orderLegs: any = [];

  constructor(private backendService: BackendService, private route: ActivatedRoute, private toast: ToastrService) {
    this.route.params.subscribe(params => {
      this.strategyId = params['id'];
      console.log(params, this.strategyId);
    });

    this.generateStrikes(-10, 10);
  }

  ngOnInit() {
    if (this.strategyId) this.getStartegy(this.strategyId);
    this.getConnections();
    this.days = [
      {
        id: 1,
        name: 'Monday'
      },
      {
        id: 2,
        name: 'Tuesday'
      },
      {
        id: 3,
        name: 'Wednesday'
      },
      {
        id: 4,
        name: 'Thursday'
      },
      {
        id: 5,
        name: 'Friday'
      }
    ];
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
    this.orderLegs = _.cloneDeep(this.strategy.positions);
  }

  async getConnections() {
    const connections: any = await this.backendService.postService(Apps.connections).toPromise();
    // console.log(connections);
    this.connections = [...this.connections, ...connections.data];
  }

  addPosition(position: any) {
    this.orderLegs.push(_.cloneDeep(position));

    // console.log(position, this.orderLegs);
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
      this.orderLegs[i].tsl.valuex = 5;
      this.orderLegs[i].tsl.valuey = 5;
    }
  }

  copyLeg(order: any) {
    const cloneOrder = cloneDeep(order);
    this.orderLegs.push(cloneOrder);
  }

  updateReentry(i: number) {
    this.orderLegs[i].reentry.type = 'RECOST';
  }

  changeReasapALL(enable: any) {
    this.orderLegs.forEach((el: any) => {
      if (enable) {
        el.reentry = {
          type: 'REASAPALL',
          value: null
        };
      } else {
        el.reentry = {
          type: null,
          value: null
        };
      }
    });

    // this.strikes = [];
    // if (stock.includes('BANKNIFTY')) {
    //   this.strikes = this.ticks;
    // } else this.strikes = this.ticks.map((el: any) => el / 2);
  }

  generateStrikes(rangeStart: number, rangeEnd: number) {
    for (let i = rangeStart; i <= rangeEnd; i++) {
      const strike: any = {};
      if (i == 0) {
        strike.id = i;
        strike.name = `ATM`;
      } else if (i < 0) {
        strike.id = i;
        strike.name = `ITM ${Math.abs(i)}`;
      } else {
        strike.id = i;
        strike.name = `OTM ${i}`;
      }
      this.strikes.push(strike);
    }
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

  changeStrikeType(id: any) {
    console.log(id);
    if (id == 'SPOT') {
      this.position.strike.type = 'SPOT';
      this.position.strike.value = 0;
    } else {
      this.position.strike.type = 'PREMIUM';
      this.position.strike.value = 100;
    }
  }

  saveStrategy() {
    // console.log(this.strategy, this.orderLegs);
    if (!this.strategy.days || (this.strategy.days && this.strategy.days.length <= 0)) {
      this.toast.error('Please Select days');
      return;
    }
    this.strategy.positions = this.orderLegs;
    console.log(this.strategy);

    this.backendService.postService(Trade.strategy, this.strategy).subscribe((res: any) => {
      this.toast.success(`${this.strategy.name} Created Succesfully`);
      console.log('Saved');
    });
  }

  updateStrategy() {
    // console.log(this.strategy, this.orderLegs);
    this.strategy.positions = this.orderLegs;
    this.backendService.putService(Trade.strategy, this.strategy).subscribe((res: any) => {
      this.toast.success(`${this.strategy.name} Updated Succesfully`);
      console.log('Updated');
    });
  }
}
