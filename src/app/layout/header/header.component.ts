import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AppContextService, CommonApiService } from '@app/services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() messageEvent = new EventEmitter<Boolean>();
  menuHidden = false;
  user: any;
  BANKNIFTY: number = 0;
  NIFTY: number = 0;
  FINNIFTY: number = 0;

  constructor(private router: Router, private appContext: AppContextService, private commonService: CommonApiService) {
    this.appContext.currentUser.subscribe((user: any) => {
      this.user = user;
      console.log(user);
    });
  }

  ngOnInit() {
    this.commonService.liveFeed.subscribe((data: any) => {
      if (data) {
        this.BANKNIFTY = data.BANKNIFTY;
        this.NIFTY = data.NIFTY;
        this.FINNIFTY = data.FINNIFTY;
      }
    });
  }

  toggleSidebar() {
    const menu: Boolean = (this.menuHidden = !this.menuHidden);
    this.messageEvent.emit(menu);
  }

  // setLanguage(language: string) {
  //   this.i18nService.language = language;
  // }

  logOut() {
    this.appContext.logout();
  }

  // get currentLanguage(): string {
  //   return this.i18nService.language;
  // }

  // get languages(): string[] {
  //   return this.i18nService.supportedLanguages;
  // }

  // get username(): string | null {
  //   const credentials = this.credentialsService.credentials;
  //   return credentials ? credentials.username : null;
  // }
}
