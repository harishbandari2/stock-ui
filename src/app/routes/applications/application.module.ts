import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ApplicationsComponent } from './applications.component';
import { ApplicationsRoutingModule } from './application-routing.module';
import { ConnectionsComponent } from './connections/connections.component';

@NgModule({
  imports: [SharedModule, ApplicationsRoutingModule],
  declarations: [ApplicationsComponent, ConnectionsComponent]
})
export class ApplicationModule {}
