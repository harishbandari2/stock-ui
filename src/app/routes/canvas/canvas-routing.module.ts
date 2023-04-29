import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CanvasComponent } from './canvas.component';

const routes: Routes = [{ path: ':id', component: CanvasComponent }];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class CanvasRoutingModule {}
