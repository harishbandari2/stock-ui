import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { RbacRoutingModule } from './rbac-routing.module';
import { RolesComponent } from './roles/roles.component';
import { UsersComponent } from './users/users.component';

@NgModule({
  imports: [SharedModule, RbacRoutingModule],
  declarations: [RolesComponent, UsersComponent]
})
export class RbacModule {}
