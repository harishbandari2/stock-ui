import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BackendService, AppContextService } from '@app/services';
import { auth } from '@app/consts/api.consts';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  isOTPVerified = false;

  constructor(
    private router: Router,
    public fb: FormBuilder,
    private backendService: BackendService,
    private toast: ToastrService
  ) {
    this.createForm();
  }

  ngOnInit() {}

  createForm() {
    this.form = this.fb.group({
      email: [null, [Validators.required, Validators.email]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      mobile: ['', Validators.required],
      otp: [null],
      password: [null, Validators.required],
      confirmpassword: [null, Validators.required]
    });
  }

  getOTP(data: any) {
    if (this.form.invalid) {
      this.toast.error('Pls provide all correct details', 'Error');
      return;
    } else if (data.password != data.confirmpassword) {
      this.toast.error('Passwords do not match', 'Error');
    }

    this.backendService.postService(auth.register, this.form.value).subscribe(
      (user: any) => {
        this.toast.success(user.data, 'Success');
        this.isOTPVerified = true;
      },
      err => {
        this.toast.error(err.error.data || err.error.message);
        this.isOTPVerified = false;
      }
    );
  }

  submit(data: any) {
    if (this.form.invalid) {
      this.toast.error('Pls provide all correct details', 'Error');
      return;
    } else if (data.password != data.confirmpassword) {
      this.toast.error('Passwords do not match', 'Error');
    }

    this.backendService.postService(auth.register, this.form.value).subscribe(
      (user: any) => {
        console.log('success', user);
        this.toast.success('Please Login to your account', 'Success');
        this.router.navigate(['/auth']);
      },
      err => {
        this.toast.error(err.error.data || err.error.message);
        this.isOTPVerified = false;
        this.form.patchValue({ otp: null });
      }
    );
  }
}
