import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthLoginGuard } from '@app/services/auth.login.guard';
import { AppsComponent } from './apps/apps.component';

const routes: Routes = [
  { path: '', canActivate: [AuthLoginGuard], component: LoginComponent },
  { path: ':app/:id', component: AppsComponent },
  { path: 'register', component: RegisterComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {}
