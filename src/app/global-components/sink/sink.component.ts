import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { MapService } from '../../services/mapper.service';

@Component({
  selector: 'app-sink',
  templateUrl: './sink.component.html',
  styleUrls: ['./sink.component.scss']
})
export class SinkComponent implements AfterViewInit, OnDestroy {
  @Input() node: any = { key: 'null' };
  @Input() function: any;
  @Input() functionIndex: any;
  @ViewChild('socket', { static: false }) socket: ElementRef;

  active: boolean = false;
  isSelected: boolean = false;
  activeNode: any;
  mappingRequiredKeys: any;

  constructor(public imapService: MapService) {
    console.log(this.node);
  }

  centrePoint() {
    const x = this.socket.nativeElement.getBoundingClientRect().x;
    const y = this.socket.nativeElement.getBoundingClientRect().y + this.socket.nativeElement.offsetHeight / 2;
    return { x, y };
  }

  ngAfterViewInit() {
    this.imapService.registerTarget(this.socket, this);
  }

  activeNodeClick() {
    this.imapService.outputActiveNode = this.node;
    this.imapService.IMapConfig.activeLineKey = this.node.key;
  }

  ngOnDestroy() {
    this.imapService.deregisterTarget(this);
  }
}
