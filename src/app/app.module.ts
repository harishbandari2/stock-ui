import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '@env/environment';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from '../app/layout/layout.module';

import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { RoutesModule } from './routes/routes.module';
import {
  AuthGuard,
  AuthLoginGuard,
  AppService,
  BackendService,
  AppContextService,
  JwtInterceptor,
  CommonApiService
} from './services';
import { AuthRoleGuard } from './services/auth.role.guard';

// import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    FormsModule,
    HttpClientModule,
    LayoutModule,
    SharedModule,
    RoutesModule,
    RouterModule
  ],
  declarations: [AppComponent],
  providers: [
    AuthGuard,
    AuthLoginGuard,
    AuthRoleGuard,
    AppService,
    BackendService,
    AppContextService,
    CommonApiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
