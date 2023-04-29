import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { CanvasService } from '@app/routes/canvas/canvas.service';
import { MapService } from '../../services/mapper.service';

@Component({
  selector: 'app-sink-point',
  template: `
    <span #sinkPoint></span>
  `
})
export class SinkPointComponent implements AfterViewInit {
  @Input() key: string;
  @ViewChild('sinkPoint', { static: false }) socket: ElementRef;
  @Input() set required(node: any) {
    console.log(node);
    if (node && !this.canvas.requiredMappingKeys[node]) this.canvas.requiredMappingKeys[node] = true;
  }
  x: any;

  constructor(public imapService: MapService, public canvas: CanvasService) {}

  ngAfterViewInit() {
    console.log(this.canvas.requiredMappingKeys);

    this.imapService.registerSinkPoint(this.key, this);
    this.x = this.socket.nativeElement.getBoundingClientRect().x + this.socket.nativeElement.offsetWidth;
  }
}
