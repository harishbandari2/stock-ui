import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TreeModule } from 'angular-tree-component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ContenteditableModule } from '@ng-stack/contenteditable';
import { TagifyModule } from 'ngx-tagify';
import { NgToggleModule } from 'ng-toggle-button';
import { ToastrModule } from 'ngx-toastr';
import { SourceComponent } from '@app/global-components/source/source.component';
import { CableComponent } from '@app/global-components/cable/cable.component';
import { SinkComponent } from '@app/global-components/sink/sink.component';
import { PatchOverlayComponent } from '@app/global-components/patch-overlay/patch-overlay.component';
import { SourcePointComponent } from '@app/global-components/patch-overlay/source-point.component';
import { SinkPointComponent } from '@app/global-components/patch-overlay/sink-point.component';
import { Type } from '@app/routes/canvas/components/json-viewer/json-viewer.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TreeModule.forRoot(),
    TagifyModule.forRoot(),
    ContenteditableModule,
    NgbModule,
    RouterModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgToggleModule, //or NgToggleModule
    ToastrModule.forRoot() // ToastrModule added
  ],
  declarations: [
    Type,
    SourceComponent,
    CableComponent,
    SinkComponent,
    PatchOverlayComponent,
    SourcePointComponent,
    SinkPointComponent
  ],
  exports: [
    CableComponent,
    SinkComponent,
    PatchOverlayComponent,
    SourcePointComponent,
    SinkPointComponent,
    SourceComponent,
    CommonModule,
    Type,
    FormsModule,
    ContenteditableModule,
    TagifyModule,
    ReactiveFormsModule,
    NgbModule,
    TreeModule,
    RouterModule,
    NgToggleModule,
    NgMultiSelectDropDownModule
  ]
})
export class SharedModule {}
