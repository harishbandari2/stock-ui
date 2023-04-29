import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, Observer } from 'rxjs';

import { AppService } from './app.service';
import { AppContextService } from './app-context.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private accountContexct: AppContextService // private appService: AppService
  ) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return new Observable((observer: Observer<boolean>) => {
      if (!this.accountContexct.isAuthenticated()) {
        this.router.navigate(['/auth']);
        observer.next(false);
        observer.complete();
      } else {
        observer.next(true);
        observer.complete();
      }
    });
  }
}
