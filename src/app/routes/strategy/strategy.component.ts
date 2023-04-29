import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Trade } from '@app/consts/api.consts';
import { BackendService, CommonApiService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-strategy',
  templateUrl: './strategy.component.html',
  styleUrls: ['./strategy.component.scss']
})
export class StrategyComponent implements OnInit, OnDestroy {
  subscription: Subscription[] = [];
  algoList: any = [];
  trades: any = [];
  portfolio: any = { MTM: 0, MARGIN: 175000, NETCHANGE: 0 };
  activeAlgos = 0;
  portfolioId: any = null;

  previousIndex: number = null;

  brokers = [
    {
      id: 1,
      name: 'Paper'
    }
  ];
  currentDay = 0;
  dropdownSettings = {
    idField: 'id',
    textField: 'name'
  };
  constructor(
    private backendService: BackendService,
    private commonService: CommonApiService,
    private toast: ToastrService,
    private route: ActivatedRoute,
    private ref: ChangeDetectorRef,
    private modal: NgbModal
  ) {
    this.route.params.subscribe(params => {
      this.portfolioId = params['id'];
    });
    const day = new Date();
    this.currentDay = day.getDay();
  }

  ngOnInit() {
    if (this.portfolioId) {
      this.getPortfolio(this.portfolioId);
    }

    let algos = this.commonService.algos.subscribe((data: any) => {
      if (data) {
        if (this.portfolioId) {
          const algos = [];
          for (let algo of data) {
            if (this.portfolio.basket && this.portfolio.basket.some((el: any) => el._id == algo._id)) {
              algos.push(algo);
            }
          }
          this.algoList = algos;
        } else this.algoList = data;
        let MTM = 0;
        let MARGIN = 0;
        this.activeAlgos = 0;
        this.algoList.forEach((el: any) => {
          if (el.MTM) MTM = el.MTM + MTM;
          MARGIN = el.margin + MARGIN;
          if (el.status == 'ACTIVE') this.activeAlgos = this.activeAlgos + 1;
        });
        this.portfolio.MTM = MTM;
        this.portfolio.margin = this.portfolio.margin ? this.portfolio.margin : MARGIN;
        this.portfolio.netchange = parseFloat(((MTM / MARGIN) * 100).toFixed(2));
      }
    });
    this.subscription.push(algos);
  }

  identify(index: any, algo: any) {
    return algo._id;
  }

  async getPortfolio(id: String) {
    const strategy: any = await this.backendService.getService(Trade.portfolio, id).toPromise();
    this.portfolio = strategy.data;
    this.portfolio['netchange'] = 0;
    this.portfolio['MTM'] = 0;
  }

  update(data: any, index: number) {
    const id = _.cloneDeep(data._id);
    if (!data.enable && (data.status === 'ACTIVE' || data.status === 'RUNNING')) {
      console.log('Please Terminate the algo and Continue');
      this.toast.error('Please Terminate the algo and Disable');
      this.algoList[index]['_id'] = data._id + 'w';
      return;
    }
    delete data.MTM;
    // const algo = { enable: data.enable };
    setTimeout(() => {
      let item = this.backendService.putService(Trade.startAlgo, data, id).subscribe(
        (res: any) => {
          this.toast.success(`${data.name} ${res.data}`);
        },
        err => {
          this.algoList[index]['_id'] = data._id + 'w';
          this.toast.error(`${err.error.data}`);
        }
      );
      this.subscription.push(item);
    }, 1000);
  }

  deleteAlgo(algo: any) {
    if (algo.status != 'DISABLED') {
      this.toast.error('Disable algo to continue delete');
      return;
    }
    let api = this.backendService.deleteService(Trade.strategy, algo._id).subscribe(
      (res: any) => {
        this.toast.success(res.data);
      },
      err => {
        this.toast.error(err.error.data);
      }
    );
    this.subscription.push(api);
  }

  ngOnDestroy(): void {
    this.subscription.forEach(el => el.unsubscribe());
  }
}
