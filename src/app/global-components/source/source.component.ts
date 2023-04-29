import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';

// import * as _ from 'lodash';

import { fromEvent, combineLatest, pipe } from 'rxjs';
import { tap, filter, startWith, skipUntil, mergeMap, take, map, delay } from 'rxjs/operators';

import { MapService } from '../../services/mapper.service';
import { CableComponent } from '../cable/cable.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-source',
  templateUrl: './source.component.html',
  styleUrls: ['./source.component.scss']
})
export class SourceComponent implements AfterViewInit, OnDestroy {
  active: boolean = false;
  activeNode: any;

  @Input() node: any = { key: 'null' };
  @Input() function: any;
  @Input() functionIndex: any;

  @ViewChild('socket', { static: false }) socket: ElementRef | any;
  @ViewChild('cable', { static: false }) cable: CableComponent;

  draggable: Subscription;

  constructor(public mapService: MapService) {
    console.log(this.node);
  }

  centrePoint() {
    const x = this.socket.nativeElement.getBoundingClientRect().x + this.socket.nativeElement.offsetWidth;
    const y = this.socket.nativeElement.getBoundingClientRect().y + this.socket.nativeElement.offsetHeight / 2;
    return { x, y };
  }

  ngAfterViewInit() {
    const down = fromEvent(this.socket.nativeElement, 'mousedown').pipe(
      filter((e: MouseEvent) => !((e.which && e.which === 3) || (e.button && e.button === 2))),
      filter(() => {
        return true;
      }),
      tap((e: MouseEvent) => e.preventDefault()),
      tap((e: MouseEvent) => {
        // console.log(this.cable,this.socket);

        this.cable.startPatch(this.socket, e);
      }),
      tap((e: MouseEvent) => {
        this.mapService.inputActiveNode = this.node;
        this.mapService.IMapConfig.activeLineKey = this.node.key;
      })
    );

    const up = fromEvent(document, 'mouseup').pipe(
      tap((e: MouseEvent) => {
        e.preventDefault();
        this.updateUpEvent(e);
      })
    );

    const mouseMove = fromEvent(document, 'mousemove').pipe(tap((e: MouseEvent) => e.stopPropagation()));

    const scrollWindow = fromEvent(document, 'scroll').pipe(startWith({}));

    const move = combineLatest(mouseMove, scrollWindow);

    const drag = down.pipe(
      mergeMap((md: MouseEvent) => {
        return move.pipe(
          map(([mm, s]) => mm),
          tap((mm: MouseEvent) => {
            this.cable.movePatch(mm);
            this.mapService.resetSelection();
            const target = this.mapService.locateTarget(mm);
            if (target) {
              target.isSelected = true;
            }
          }),
          skipUntil(
            up.pipe(
              take(1),
              tap(() => this.cable.endPatch())
            )
          ),
          take(1)
        );
      })
    );

    this.draggable = drag.subscribe((e: MouseEvent) => {
      // }
      this.mapService.resetSelection();
    });
  }

  updateUpEvent(e: MouseEvent) {
    const target = this.mapService.locateTarget(e);
    // const isConnected = this.mapService.notConnected(this, target);
    if (target) {
      this.mapService.connect(this, target);
      this.mapService.outputActiveNode = target.node;
    }
  }

  ngOnDestroy() {
    this.draggable.unsubscribe();
  }
}
