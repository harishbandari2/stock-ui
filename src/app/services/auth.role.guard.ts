import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, Observer } from 'rxjs';
import { AppContextService } from './app-context.service';

@Injectable()
export class AuthRoleGuard implements CanActivate {
  permissions: any;

  constructor(private router: Router, private accountContext: AppContextService) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    this.permissions = this.accountContext.permissions[route.data.name];
    let access: any;
    if (typeof this.permissions === 'undefined') {
      access = false;
    } else access = this.permissions.includes('read') || this.permissions.length > 0;
    return new Observable((observer: Observer<boolean>) => {
      if (access) {
        observer.next(true);
        observer.complete();
      } else {
        this.router.navigate(['/403']);
        console.log('denied');

        // this.msg.error("Permission Denied");
        observer.next(false);
        observer.complete();
      }
    });
  }
}
