import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { AuditsComponent } from './audits.component';
import { AuditRoutingModule } from './audit-routing.module';

@NgModule({
  imports: [SharedModule, AuditRoutingModule],
  declarations: [AuditsComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AuditModule {}
