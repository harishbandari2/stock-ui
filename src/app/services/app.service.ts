import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppContextService } from './app-context.service';
import { BaseURL, auth, Apps } from '../consts/api.consts';
import { BackendService } from './backend.service';
//  import { BackendService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  constructor(
    private http: HttpClient,
    private backendService: BackendService,
    private appContext: AppContextService
  ) {}

  getConnectionById(id: string) {
    return this.backendService.getService(Apps.connection, id);
  }

  logout(): void {
    // this.appContext.logout();
  }
}
