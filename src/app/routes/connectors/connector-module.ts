import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
// import { SourceComponent } from "../../global-components/source/source.component";
// import { SinkComponent } from "../../global-components/sink/sink.component";
import { ConnectorComponent } from './list/connector/connector.component';
import { ConnectorEditComponent } from './connector-edit/connector-edit.component';
import { ConnectorRoutingModule } from './connector-routing.module';
// import { SourcePointComponent } from "../../global-components/patch-overlay/source-point.component";
// import { SinkPointComponent } from "../../global-components/patch-overlay/sink-point.component";
// import { PatchOverlayComponent } from "../../global-components/patch-overlay/patch-overlay.component";
// import { CableComponent } from '../../global-components/cable/cable.component';
// SourcePointComponent,

@NgModule({
  imports: [SharedModule, ConnectorRoutingModule],
  declarations: [ConnectorComponent, ConnectorEditComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ConnectorModule {}
