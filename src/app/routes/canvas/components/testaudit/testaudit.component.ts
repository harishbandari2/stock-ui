import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MapService } from '@app/services/mapper.service';

@Component({
  selector: 'app-testaudit',
  templateUrl: './testaudit.component.html',
  styleUrls: ['./testaudit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TestauditComponent implements OnInit {
  public components: string[] = [];
  public activeComponent: string = null;
  public showLarge = false;

  constructor(public mapper: MapService) {}

  ngOnInit() {
    this.components = Object.keys(this.mapper.testData);
  }

  clickComponent(data: string) {
    this.activeComponent = data;
  }
  windowResize() {
    this.showLarge = !this.showLarge;
    setTimeout(() => {
      this.mapper.mapSinkKeys.next(this.mapper.sinkKeys);
    }, 50);
  }
}
