import { Injectable, Injector } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
// import { AccountService } from './account.service';

// import { AuthConstants } from '../consts/api.consts';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private injector: Injector, public router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add authorization header with jwt token if available
    const re = /test/gi;
    const sc = /schemasandtables/gi;
    const cs = /columns/gi;
    // Exclude interceptor for login request:

    const accessToken = localStorage.getItem('token');

    if (
      accessToken &&
      request.url.search(re) === -1 &&
      request.url.search(sc) === -1 &&
      request.url.search(cs) === -1
    ) {
      // console.log(1);
      request = request.clone({
        setHeaders: {
          token: accessToken
        }
      });
    }

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // do stuff with response if you want
          }
        },
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              localStorage.clear();
              this.router.navigateByUrl('/auth');
              // this.injector.get(AccountService).logout();
            } else {
              // console.log('XHR request error...');
              // console.log(JSON.stringify(err));
            }
          }
        }
      )
    );
  }
}
