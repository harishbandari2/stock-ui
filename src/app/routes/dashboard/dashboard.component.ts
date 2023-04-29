import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppContextService, BackendService } from '@app/services';
import { CommonApiService } from '@app/services/common-api.service';
import { Metadata, Rbac } from '@app/consts/api.consts';
import { Subscription } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  subscription: Subscription[] = [];
  currentDay = 0;

  stats: any = {
    totalalgos: 0,
    totalenabled: 0,
    totaldisabled: 0,
    livealgos: 0,
    liveenabled: 0,
    livedisabled: 0,
    liveMTM: 0
  };
  algoList: any = [];
  liveAlgos: any = [];

  constructor(
    private appContext: AppContextService,
    private toast: ToastrService,
    private backendService: BackendService,
    private commonService: CommonApiService,
    private modal: NgbModal
  ) {
    const day = new Date();
    this.currentDay = day.getDay();
    let algos = this.commonService.algos.subscribe((data: any) => {
      if (data) {
        // this.stats = {};
        this.algoList = data;
        this.liveAlgos = this.algoList.filter(
          (algo: any) =>
            algo.enable &&
            algo.days.some((el: any) => el.id == this.currentDay) &&
            algo.brokers.some((el: any) => el.name != 'Paper')
        );
        this.stats['totalalgos'] = this.algoList.length;
        this.stats['totalenabled'] = this.algoList.filter((el: any) => el.enable).length;
        this.stats['totaldisabled'] = this.stats['totalalgos'] - this.stats['totalenabled'];
        // console.log(this.stats);
        let livealgos = 0;
        let liveMTM = 0;
        for (let algo of data) {
          if (algo.brokers.some((el: any) => el.name != 'Paper')) {
            livealgos = livealgos + 1;
            liveMTM = algo.MTM ? liveMTM + parseFloat(algo.MTM) : liveMTM;
          }
        }
        this.stats['livealgos'] = livealgos;
        this.stats['liveenabled'] = this.liveAlgos.length;
        this.stats['livedisabled'] = this.stats['livealgos'] - this.stats['liveenabled'];
        this.stats['liveMTM'] = liveMTM;
      }
    });
    this.subscription.push(algos);
  }

  identify(index: any, algo: any) {
    return algo._id;
  }

  ngOnInit() {
    this.getMetadata('subscriptions');
  }

  getMetadata(meta: string) {}

  ngOnDestroy(): void {
    this.subscription.forEach(el => el.unsubscribe());
  }
}
