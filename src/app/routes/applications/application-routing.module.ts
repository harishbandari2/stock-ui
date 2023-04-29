import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationsComponent } from './applications.component';
import { ConnectionsComponent } from './connections/connections.component';
import { AuthRoleGuard } from '@app/services/auth.role.guard';

const routes: Routes = [
  { path: '', component: ApplicationsComponent, data: { name: 'applications' } },
  { path: ':id', component: ConnectionsComponent, data: { name: 'applications' } },
  { path: 'oauth', component: ConnectionsComponent, canActivate: [AuthRoleGuard], data: { name: 'applications' } }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class ApplicationsRoutingModule {}
