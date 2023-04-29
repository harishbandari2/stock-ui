import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AppService, BackendService, AppContextService } from '@app/services';
import { BaseURL, auth, Rbac } from '@app/consts/api.consts';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  resetForm: FormGroup;
  errorMessage = '';
  loading = false;
  status: boolean;
  signupActive = false;

  forgotPassword = false;
  isOTPSent = false;

  constructor(
    public fb: FormBuilder,
    private backendService: BackendService,
    private appContext: AppContextService,
    private toast: ToastrService,
    private router: Router
  ) {
    this.createForm();
  }

  createForm() {
    this.form = this.fb.group({
      email: [null, [Validators.required]],
      status: [true],
      password: [null, Validators.required]
    });
  }

  createResetForm() {
    this.resetForm = this.fb.group({
      id: [null],
      email: [null, [Validators.required]],
      otp: [null, [Validators.required]],
      password: [null, Validators.required],
      confirmpassword: [null, Validators.required]
    });
  }

  ngOnInit() {}

  get mobile() {
    return this.form.controls.email;
  }
  get password() {
    return this.form.controls.password;
  }

  forgotPasswordClick() {
    this.createResetForm();
    this.forgotPassword = true;
  }

  getOTP(data: any) {
    if (!data.email) {
      this.toast.error('Please enter email');
      return;
    } else {
      this.backendService.postService(auth.reset, data).subscribe(
        (user: any) => {
          this.toast.success(user.data, 'Success');
          this.resetForm.patchValue({ id: user.data._id });
          this.isOTPSent = true;
        },
        err => {
          this.toast.error(err.error.message || 'Invalid Mobile Number');
        }
      );
    }
  }

  resetPassword(data: any) {
    console.log(data);
    if (this.resetForm.invalid) {
      this.toast.error('Pls provide all correct details', 'Error');
      return;
    } else if (data.password != data.confirmpassword) {
      this.toast.error('Passwords do not match', 'Error');
    }

    this.backendService.postService(auth.update, data).subscribe(
      (res: any) => {
        console.log(res);
        this.toast.success('Profile Updated');
        this.router.navigate(['/auth']);
      },
      err => {
        this.toast.error(err.error.data || 'Profile Not Updated');
      }
    );
  }

  submit() {
    this.errorMessage = '';
    this.mobile.markAsDirty();
    this.mobile.updateValueAndValidity();
    this.password.markAsDirty();
    this.password.updateValueAndValidity();
    if (this.mobile.invalid || this.password.invalid) return;
    this.loading = true;
    console.log(1);
    this.backendService.postService(auth.login, this.form.value).subscribe(
      (user: any) => {
        localStorage.setItem('token', user.data.token);
        this.appContext.login(user);
      },
      err => {
        this.toast.error('Invalid User/Password');
      }
    );
  }
}
