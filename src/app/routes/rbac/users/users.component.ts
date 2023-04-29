import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Rbac } from '@app/consts/api.consts';
import { BackendService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  userList: any = [];
  userForm: FormGroup;

  rolesList: any = [];
  selectedRoles: any = [];
  dropdownSettings = {};
  currentUser: any;

  subscription: Subscription[] = [];

  constructor(private backendService: BackendService, private modal: NgbModal, private fb: FormBuilder) {
    this.createFrom();
  }

  ngOnInit() {
    this.getUsers();
    this.getRoles();

    this.dropdownSettings = {
      singleSelection: false,
      idField: '_id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  createFrom() {
    this.userForm = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      roles: []
    });
  }

  getUsers() {
    let data = this.backendService.getService(Rbac.users).subscribe((res: any) => {
      this.userList = res.data;
      console.log(this.userList);
    });
    this.subscription.push(data);
  }

  getRoles() {
    let data = this.backendService.getService(Rbac.role).subscribe((res: any) => {
      this.rolesList = res.data;
      console.log(this.rolesList);
    });
    this.subscription.push(data);
  }

  openModel(content: any) {
    this.modal.open(content, { backdrop: 'static' });
    this.userForm.reset();
  }

  closeModel() {
    this.modal.dismissAll();
  }

  assignRole(content: any, user: any) {
    this.modal.open(content, { backdrop: 'static' });
    this.currentUser = user;
    this.selectedRoles = this.userList[user].roles;
    // this.userForm.reset();
  }

  clickRole(data: any) {
    // console.log(data);
    // this.selectedRoles.push(data);
    console.log(this.selectedRoles, this.currentUser);
    // data.target.value = '';
  }

  saveRoles() {
    this.closeModel();
    let user = this.userList[this.currentUser];
    user.roles = this.selectedRoles;
    let api = this.backendService.putService(Rbac.users, user, user._id).subscribe((res: any) => {
      this.userList[this.currentUser] = user;
    });
    this.subscription.push(api);
  }

  save(data: any) {
    this.closeModel();
    let api = this.backendService.postService(Rbac.role, data).subscribe((res: any) => {
      this.userList = [...this.userList, data];
    });
    this.subscription.push(api);
  }
}
