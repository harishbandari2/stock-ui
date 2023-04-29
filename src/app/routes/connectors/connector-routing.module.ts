import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ConnectorComponent } from './list/connector/connector.component';
import { ConnectorEditComponent } from './connector-edit/connector-edit.component';

const routes: Routes = [
  { path: '', component: ConnectorComponent },
  { path: ':id', component: ConnectorEditComponent }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class ConnectorRoutingModule {}
