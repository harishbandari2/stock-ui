import { Component, Input, Output, OnInit, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss']
})
export class SideBarComponent implements OnInit {
  sidebar = true;
  active = 'dashboard';

  @Input() menu: Boolean;
  @Output() messageEvent = new EventEmitter<Boolean>();

  constructor() {}

  ngOnInit() {}

  activeLink(link: string) {
    this.active = link;
    if (this.menu) this.messageEvent.emit(this.menu != this.menu);
  }
}
