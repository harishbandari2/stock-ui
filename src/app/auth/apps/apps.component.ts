import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Apps } from '@app/consts/api.consts';
import { BackendService } from '@app/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-apps',
  templateUrl: './apps.component.html',
  styleUrls: ['./apps.component.scss']
})
export class AppsComponent implements OnInit {
  app: any;

  constructor(private route: ActivatedRoute, private backendService: BackendService, private toast: ToastrService) {
    this.app = {};
    this.route.params.subscribe(params => {
      console.log(params);
      this.app['name'] = params['app'];
      this.app['connectionId'] = params['id'];
    });
  }

  ngOnInit() {
    console.log();
  }

  submit() {
    console.log(this.app);
    let api = this.backendService.postService(Apps.loginfinvasia, this.app).subscribe(
      (res: any) => {
        console.log(res);
        if (res.success) {
          this.toast.success(res.data);
          window.self.close();
        }
        // this.componentList = [...this.componentList, data];
      },
      err => {
        this.toast.error(err);
      }
    );
  }
}
