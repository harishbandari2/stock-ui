import { Injectable } from '@angular/core';
import { ReplaySubject, BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router';
// import { LoginEndpoint } from "../consts/api.consts";
import { BackendService } from './backend.service';
import { auth } from '@app/consts/api.consts';
import * as _ from 'lodash';
import { CommonApiService } from './common-api.service';

@Injectable({
  providedIn: 'root'
})
export class AppContextService {
  public isMainNavCollapsed: boolean = false;
  public isLoggedIn: ReplaySubject<boolean>;
  public currentUser: Subject<any> = new BehaviorSubject<any>(null);
  public applications: Subject<any> = new BehaviorSubject<any>(null);
  public indices: Subject<any> = new BehaviorSubject<any>({ BANKNIFTY: 1, NIFTY: 1 });
  public user: any;
  permissions: any = {};
  // permissionObj = {};

  constructor(public router: Router, public backendService: BackendService, public commonService: CommonApiService) {
    this.isLoggedIn = new ReplaySubject(1);
    // this.currentUser.subscribe(res => {
    //   this.user = res;
    //   // this.resolvePermissions();
    // });
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token ? true : false;
  }

  public isUserLoaded(): boolean {
    return this.user ? true : false;
  }

  async login(user: any) {
    this.user = null;
    await this.fetchUserInfo();
    this.isLoggedIn.next(true);
    this.router.navigateByUrl('/');
  }

  async fetchUserInfo() {
    if (!this.isUserLoaded()) {
      const user: any = await this.backendService.getService(auth.userinfo).toPromise();
      this.user = user.data;
      this.applyPermissions(user.data.access);
      this.currentUser.next(user.data);
      this.commonService.sendMessage(this.user._id);
      // setTimeout(() => {
      // this.commonService.createSocketServer();
      // }, 1000);
    }
  }

  applyPermissions(roles: any): void {
    let entities: any = [];
    roles.forEach((el: any) => {
      entities.push(...el.permissions.map((per: any) => per));
    });

    entities.forEach((el: any) => {
      if (!this.permissions[el.entitie]) {
        this.permissions[el.entitie] = el.permissions.map((per: any) => per.id);
      } else {
        const newPer = el.permissions.map((per: any) => per.id);
        this.permissions[el.entitie] = _.union(this.permissions[el.entitie], newPer);
      }
    });
  }

  logout(): void {
    this.router.navigateByUrl('/auth');
    this.isLoggedIn.next(false);
    this.currentUser.next(null);
    localStorage.clear();
    this.commonService.ngOnDestroy();
  }
}
