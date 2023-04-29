import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RolesComponent } from './roles/roles.component';
import { UsersComponent } from './users/users.component';
import { AuthRoleGuard } from '@app/services/auth.role.guard';

const routes: Routes = [
  { path: 'roles', canActivate: [AuthRoleGuard], component: RolesComponent, data: { name: 'roles' } },
  { path: 'users', canActivate: [AuthRoleGuard], component: UsersComponent, data: { name: 'users' } }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class RbacRoutingModule {}
