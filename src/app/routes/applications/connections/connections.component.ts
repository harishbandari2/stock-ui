import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '@app/services';
import { Subscription } from 'rxjs';
import { NxInitFormService } from '@app/services/nx-init-form.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Apps } from '@app/consts/api.consts';
import { fivePaisa, zerodha, finvasia } from '../../../../assets/staticdata';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-connections',
  templateUrl: './connections.component.html',
  styleUrls: ['./connections.component.scss']
})
export class ConnectionsComponent implements OnInit, OnDestroy {
  appId: string;
  connectionId: string = null;
  appData: any;
  connForm: FormGroup;
  configForm: FormGroup;
  activeConnection: any;

  subscription: Subscription[] = [];
  options = { displayField: 'title' };
  private windowHandle: any = null;

  config = {};
  formData: any = [];

  constructor(
    private route: ActivatedRoute,
    private backendService: BackendService,
    private toast: ToastrService,
    private fb: FormBuilder // public nxInitFormService: NxInitFormService // private windows: WindowService,
  ) {
    this.route.params.subscribe(params => {
      this.appId = params['id'];
      this.getConnections(this.appId);
      // this.createFrom();
    });
    console.log('load', this.connForm, this.config);
  }

  ngOnInit() {}

  createFrom() {
    const group = {};
    for (const item of this.formData) {
      group[item.control] = this.fb.control('', [Validators.required]);
    }
    this.connForm = this.fb.group(group);
  }

  getConnections(id: any) {
    let item = this.backendService.getService(Apps.applications, id).subscribe((res: any) => {
      this.appData = res.data;
      if (res.data && res.data.connections) {
        this.activeConnection = res.data.connections[0];
        if (this.appData.name == '5Paisa') this.formData = fivePaisa;
        else if (this.appData.name == 'Zerodha') this.formData = zerodha;
        else if (this.appData.name == 'Finvasia') this.formData = finvasia;
        this.createFrom();
        this.editConnection(this.activeConnection);
      }
    });
    this.subscription.push(item);
  }

  trackByFn(index: any) {
    return index; // or item.id
  }

  editConnection(conn: any) {
    if (conn) {
      this.connectionId = conn.id;
      this.connForm.patchValue(conn, { onlySelf: true });
      this.config = conn.config;
      this.connectionId = conn._id;
    }
    // if (conn.config) this.initForms(conn.config);
  }
  newConnection() {
    // if (this.appData.name === '5Paisa') {
    //   this.toast.error('5Paisa App disabled currentley');
    //   return;
    // }
    this.connectionId = null;
    this.connForm.reset();
  }

  // login(config:any){
  //   this.backendService.postService(Apps.login5paisa, config).subscribe((res: any) => {
  //     console.log(res);

  //   })
  // }

  public doLogin(url: string, config?: any) {
    let authUrl = url;
    authUrl = `${authUrl}${this.connectionId}`;
    this.windowHandle = window.open(authUrl, 'OAuth', `width=1000px,height=660px,left=500px,top=140`);
  }

  saveConnection() {
    let connection = this.connForm.value;
    if (this.connectionId) connection.id = this.connectionId;
    connection.appId = this.appId;
    console.log(connection, this.config);
    let item;
    item = this.backendService.postService(Apps.connection, connection).subscribe((res: any) => {
      if (!this.connectionId) {
        this.appData.connections = [...this.appData.connections, res.data];
      }
    });
    this.subscription.push(item);
  }

  ngOnDestroy() {
    this.subscription.forEach(sub => sub.unsubscribe());
  }
}
