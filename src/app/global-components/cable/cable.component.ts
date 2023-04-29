import { Component, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'app-cable',
  templateUrl: './cable.component.html',
  styleUrls: ['./cable.component.scss']
})
export class CableComponent implements OnInit {
  constructor() {}

  ngOnInit() {}

  startX: number;
  startY: number;
  moveX: number;
  moveY: number;
  isPatching: boolean = false;

  public startPatch(el: ElementRef, e: MouseEvent) {
    this.startX = el.nativeElement.getBoundingClientRect().x + el.nativeElement.offsetWidth;
    this.startY = el.nativeElement.getBoundingClientRect().y + el.nativeElement.offsetHeight / 2;

    this.moveX = e.clientX;
    this.moveY = e.clientY;

    this.isPatching = true;
  }

  public movePatch(mm: MouseEvent) {
    this.moveX = mm.clientX;
    this.moveY = mm.clientY;
  }

  public endPatch() {
    this.isPatching = false;
  }

  get cX1() {
    return this.startX - window.scrollX;
  }
  get cY1() {
    return this.startY - window.scrollY;
  }
  get cX2() {
    return this.moveX;
  }
  get cY2() {
    return this.moveY;
  }

  get path() {
    const x1 = this.startX - window.scrollX;
    const y1 = this.startY - window.scrollY;

    // const pX = (y1 < this.moveY) ? x1 : this.moveX;
    // const pY = (y1 < this.moveY) ? this.moveY : y1;

    return `${x1},${y1} ${x1 + 15},${y1} ${this.moveX - 15},${this.moveY} ${this.moveX},${this.moveY}`;
  }
}
