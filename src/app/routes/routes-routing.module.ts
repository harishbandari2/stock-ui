import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// layout
import { LayoutDefaultComponent } from '../layout/default.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from '@app/services/auth.guard';
import { AuthLoginGuard } from '@app/services';
import { Exception403Component } from './errors/exception403/exception403.component';
import { TradesComponent } from './trades/trades.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { BuilderComponent } from './builder/builder.component';

// import { AuthGuard, AuthRoleGuard } from '../services';
// import { AuthLoginGuard } from '../services/auth.login.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutDefaultComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'rbac', loadChildren: './rbac/rbac.module#RbacModule' },
      { path: 'apps', loadChildren: './applications/application.module#ApplicationModule' },
      { path: 'trades', component: TradesComponent },
      { path: 'portfolio', component: PortfolioComponent },
      { path: 'trades/:app', component: TradesComponent },
      { path: 'strategy', loadChildren: './strategy/strategy.module#StrategyModule' },
      { path: 'create', component: BuilderComponent, data: { name: 'strategy' } },
      { path: 'create/:id', component: BuilderComponent, data: { name: 'strategy' } },

      { path: 'profile', loadChildren: './profile/profile.module#ProfileModule' },
      { path: '403', component: Exception403Component }
    ]
  },
  { path: 'auth', loadChildren: '../auth/auth.module#AuthModule' },
  // { path: 'auth/app',loadChildren: '../auth/auth.module#AuthModule' },

  { path: '**', redirectTo: '404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class RouteRoutingModule {}
