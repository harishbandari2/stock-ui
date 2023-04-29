import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ProfileComponent } from './profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { SubscriptionComponent } from './subscription/subscription.component';

@NgModule({
  imports: [SharedModule, ProfileRoutingModule],
  declarations: [ProfileComponent, SubscriptionComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ProfileModule {}
