import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Rbac } from '@app/consts/api.consts';
import { AppContextService, BackendService } from '@app/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public currentTab = 'Basic';
  public basicForm: FormGroup;
  public passwordForm: FormGroup;
  public user: any;

  constructor(
    public fb: FormBuilder,
    private backendService: BackendService,
    private appContextService: AppContextService,
    private toast: ToastrService
  ) {
    this.createFrom();
    this.createPasswordForm();
    // this.getUser();

    this.appContextService.currentUser.subscribe((res: any) => {
      this.user = res;
      if (res) this.basicForm.patchValue(res, { onlySelf: true });
    });
  }

  ngOnInit() {}

  getUser() {
    const userId = localStorage.getItem('userId');
  }

  createFrom() {
    this.basicForm = this.fb.group({
      _id: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobile: [{ value: '', disabled: true }, Validators.required],
      address: ['', Validators.required],
      state: ['', Validators.required],
      pin: ['', Validators.required]
    });
  }

  createPasswordForm() {
    this.passwordForm = this.fb.group({
      oldPassword: [null, Validators.required],
      newPassword: [null, Validators.required]
    });
  }

  saveProfile(user: any) {
    this.backendService.putService(Rbac.users, user, user._id).subscribe(
      (res: any) => {
        console.log(res);
        this.toast.success('Profile Updated');
      },
      err => {
        this.toast.error('Profile Not Updated');
      }
    );
  }

  activeTab(tab: string) {
    this.currentTab = tab;
  }
}
