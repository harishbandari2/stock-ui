import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { RouteRoutingModule } from './routes-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Exception403Component } from './errors/exception403/exception403.component';
import { TradesComponent } from './trades/trades.component';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { BuilderComponent } from './builder/builder.component';

@NgModule({
  imports: [SharedModule, RouteRoutingModule],
  declarations: [DashboardComponent, Exception403Component, TradesComponent, PortfolioComponent, BuilderComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class RoutesModule {}
