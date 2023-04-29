import { Component, Input, HostListener } from '@angular/core';

import { Router, NavigationEnd, RouteConfigLoadStart, NavigationError, NavigationCancel } from '@angular/router';

@Component({
  selector: 'layout-default',
  templateUrl: './default.component.html'
})
export class LayoutDefaultComponent {
  isVisible = false;
  iconChange = false;
  isFetching = false;
  menu = false;
  message: string;

  onClick() {
    if (this.menu) this.menu = !this.menu;
  }

  receiveMessage($event: any) {
    this.menu = !this.menu;
  }

  onChildClick() {
    console.log('Child button clicked');
  }

  constructor(router: Router) {
    const body = document.querySelector('body');
    router.events.subscribe(evt => {
      if (!this.isFetching && evt instanceof RouteConfigLoadStart) {
        this.isFetching = true;
        body.style.cursor = 'progress';
      }
      if (evt instanceof NavigationError || evt instanceof NavigationCancel) {
        this.isFetching = false;
        if (evt instanceof NavigationError) {
        }
        return;
      }
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      setTimeout(() => {
        this.isFetching = false;
        body.style.cursor = 'auto';
      }, 100);
    });
  }

  toggleSidebar() {
    console.log('ui');

    // this.menuHidden = !this.menuHidden;
  }
}
