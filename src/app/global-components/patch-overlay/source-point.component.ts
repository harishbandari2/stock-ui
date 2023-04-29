import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { MapService } from '../../services/mapper.service';

@Component({
  selector: 'app-source-point',
  template: `
    <span #sourcePoint></span>
  `
})
export class SourcePointComponent implements AfterViewInit {
  @Input() key: string;
  @ViewChild('sourcePoint', { static: false }) socket: ElementRef;

  constructor(public imapService: MapService) {}

  ngAfterViewInit() {
    this.imapService.registerSourcePoint(this.key, this);
  }
}
