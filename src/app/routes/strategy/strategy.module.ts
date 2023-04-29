import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { StrategyComponent } from './strategy.component';
import { StrategyRoutingModule } from './strategy-routing.module';

@NgModule({
  imports: [SharedModule, StrategyRoutingModule],
  declarations: [StrategyComponent]
})
export class StrategyModule {}
