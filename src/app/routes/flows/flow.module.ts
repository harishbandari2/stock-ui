import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { FlowsComponent } from './flows.component';
import { FlowsRoutingModule } from './flow-routing.module';

@NgModule({
  imports: [SharedModule, FlowsRoutingModule],
  declarations: [FlowsComponent]
})
export class FlowModule {}
