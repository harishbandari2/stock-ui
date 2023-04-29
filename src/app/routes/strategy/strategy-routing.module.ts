import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { StrategyComponent } from './strategy.component';

const routes: Routes = [
  { path: '', component: StrategyComponent, data: { name: 'strategy' } },
  { path: ':id', component: StrategyComponent, data: { name: 'strategy' } }
  // { path: 'create', component: BuilderComponent, data: { name: 'strategy' } },
  // { path: 'create/:id', component: BuilderComponent, data: { name: 'strategy' } }
  // { path: 'oauth', component: ConnectionsComponent, canActivate: [AuthRoleGuard], data: { name: 'applications' } }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class StrategyRoutingModule {}
