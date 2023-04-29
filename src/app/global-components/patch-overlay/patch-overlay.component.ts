import { AfterViewInit, OnInit, OnDestroy, Component, ElementRef, HostListener } from '@angular/core';
import { MapService } from '../../services/mapper.service';

@Component({
  selector: 'app-patch-overlay',
  templateUrl: './patch-overlay.component.html',
  styleUrls: ['./patch-overlay.component.scss']
})
export class PatchOverlayComponent implements OnInit, AfterViewInit, OnDestroy {
  w: number = 0;
  h: number = 0;
  updatedPaths: any = [];

  constructor(private patches: MapService) {}

  @HostListener('window:resize', ['$event'])
  adjustConnectedPatches() {
    this.patches.getUpdatedSVGPaths();
  }

  ngOnInit() {
    this.patches.getUpdatedSVGPaths();
  }

  get paths() {
    return this.patches.updatedSVGPaths;
  }

  ngAfterViewInit() {}

  ngOnDestroy(): void {}
}
