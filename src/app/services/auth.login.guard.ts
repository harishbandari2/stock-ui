import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, Observer } from 'rxjs';

import { AppContextService } from './app-context.service';

@Injectable()
export class AuthLoginGuard implements CanActivate {
  constructor(private router: Router, private acountContext: AppContextService) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean {
    return new Observable((observer: Observer<boolean>) => {
      if (this.acountContext.isAuthenticated()) {
        this.router.navigate(['/']);
        observer.next(false);
        observer.complete();
      } else {
        observer.next(true);
        observer.complete();
      }
    });
  }
}
