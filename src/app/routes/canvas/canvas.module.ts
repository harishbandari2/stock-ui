import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
// import { SourceComponent } from '../../global-components/source/source.component';
// import { SinkComponent } from '../../global-components/sink/sink.component';
// import { CableComponent } from '../../global-components/cable/cable.component';
// import { PatchOverlayComponent } from '../../global-components/patch-overlay/patch-overlay.component';
// import { SourcePointComponent } from '../../global-components/patch-overlay/source-point.component';
// import { SinkPointComponent } from '../../global-components/patch-overlay/sink-point.component';
import { CanvasComponent } from '../canvas/canvas.component';
import { CanvasRoutingModule } from './canvas-routing.module';
import { TestauditComponent } from './components/testaudit/testaudit.component';
import { JsonViewerComponent } from './components/json-viewer/json-viewer.component';
import { FlowComponent } from './components/flow/flow.component';
import { CanvasService } from './canvas.service';
import { MapperComponent } from './components/mapper/mapper.component';
import { SanitizedHtmlPipe } from './components/mapper/parse-pipe';

@NgModule({
  imports: [SharedModule, CanvasRoutingModule],
  declarations: [
    // SourceComponent,
    // CableComponent,
    // PatchOverlayComponent,
    // SinkComponent,
    // SourcePointComponent,
    // SinkPointComponent,
    CanvasComponent,
    TestauditComponent,
    JsonViewerComponent,
    FlowComponent,
    MapperComponent,
    SanitizedHtmlPipe
  ],
  providers: [CanvasService]
})
export class CanvasModule {}
