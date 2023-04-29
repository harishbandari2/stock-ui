import { NgModule } from '@angular/core';

import { SharedModule } from '../shared/shared.module';

import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';

import { LayoutDefaultComponent } from './default.component';

const COMPONENTS = [HeaderComponent, SideBarComponent, LayoutDefaultComponent];

@NgModule({
  imports: [SharedModule],
  providers: [],
  declarations: [...COMPONENTS],
  exports: [...COMPONENTS]
})
export class LayoutModule {}
