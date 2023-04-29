import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseURL } from '../consts/api.consts';

@Injectable()
export class BackendService {
  contentHeaders: any;

  constructor(private http: HttpClient) {}

  setContentHeaders(headers?: any) {
    const contentHeaders = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    for (const key in headers) {
      contentHeaders[key] = headers[key];
    }
    this.contentHeaders = { headers: new HttpHeaders(contentHeaders) };
  }

  getService(URL: any, id?: any, page?: any, size?: any, headers?: any) {
    this.setContentHeaders(headers);
    const url_1 = id ? `${URL}/${id}` : `${URL}`;
    const url = page && size ? `${url_1}?page=${page}&size=${size}` : url_1;
    return this.http.get(`${BaseURL}${url}`, this.contentHeaders);
  }

  postDataService(URL: any, data: any, params?: any, queryParams?: any, headers?: any) {
    this.setContentHeaders(headers);
    let stringParams: string = '';
    let stringQueryParams: string = '?';
    if (typeof params !== 'object') {
      stringParams = '/' + params;
    } else {
      for (const key in params) {
        stringParams += '/' + params[key];
      }
    }
    for (const key in queryParams) {
      stringQueryParams += `${key}=${queryParams[key]}&`;
    }
    stringQueryParams = stringQueryParams.slice(0, -1);
    const url = `${BaseURL}${URL}${stringParams}${stringQueryParams}`;
    return this.http.post(url, JSON.stringify(data), this.contentHeaders);
  }

  getDataService(URL: any, params?: any, queryParams?: any, headers?: any) {
    this.setContentHeaders(headers);
    let stringParams: string = '';
    let stringQueryParams: string = '?';
    if (typeof params !== 'object') {
      stringParams = '/' + params;
    } else {
      for (const key in params) {
        stringParams += '/' + params[key];
      }
    }
    for (const key in queryParams) {
      stringQueryParams += `${key}=${queryParams[key]}&`;
    }
    stringQueryParams = stringQueryParams.slice(0, -1);
    const url = `${BaseURL}${URL}${stringParams}${stringQueryParams}`;
    return this.http.get(url, this.contentHeaders);
  }

  putService(URL: any, data: any, id?: any, headers?: any) {
    this.setContentHeaders(headers);
    const url = id ? `${URL}/${id}` : `${URL}`;
    return this.http.put(`${BaseURL}${url}`, JSON.stringify(data), this.contentHeaders);
  }

  postService(URL: any, data?: any, id?: any, headers?: any) {
    this.setContentHeaders(headers);
    const url = id ? `${URL}/${id}` : `${URL}`;
    return this.http.post(`${BaseURL}${url}`, JSON.stringify(data), this.contentHeaders);
  }

  patchService(URL: any, data?: any, id?: any, headers?: any) {
    this.setContentHeaders(headers);
    const url = id ? `${URL}/${id}` : `${URL}`;
    return this.http.patch(`${BaseURL}${url}`, JSON.stringify(data), this.contentHeaders);
  }

  deleteService(URL: any, id?: any, headers?: any) {
    this.setContentHeaders(headers);
    const url = id ? `${URL}/${id}` : `${URL}`;
    return this.http.delete(`${BaseURL}${URL}/${id}`, this.contentHeaders);
  }

  uploadFile(URL: any, data: any) {
    const contentHeaders = { headers: new HttpHeaders({ itemType: 'avatar' }) };
    return this.http.put(`${BaseURL}${URL}`, data, contentHeaders);
  }
}
