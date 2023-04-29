import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Rbac } from '@app/consts/api.consts';
import { BackendService } from '@app/services';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  roleList: any = [];
  roleForm: FormGroup;

  grantedPermissions: any = [];
  permissionList: any = [];
  dropdownSettings = {};
  currentRole: any = null;

  entities = ['transactions', 'users', 'roles', 'applications'];

  subscription: Subscription[] = [];

  constructor(private backendService: BackendService, private modal: NgbModal, private fb: FormBuilder) {
    this.createFrom();
  }

  ngOnInit() {
    this.getRoles();
    this.addPermissions();
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  createFrom() {
    this.roleForm = this.fb.group({
      name: [null, Validators.required],
      description: [null, Validators.required],
      permissions: []
    });
  }

  addPermissions() {
    const permissions = [
      {
        id: 'create',
        name: 'Create'
      },
      {
        id: 'read',
        name: 'Read'
      },
      {
        id: 'update',
        name: 'Update'
      },
      {
        id: 'delete',
        name: 'Delete'
      }
    ];

    this.permissionList = this.entities.map(el => {
      return {
        entitie: el,
        permissions: permissions
      };
    });
    console.log(this.permissionList);
  }

  getRoles() {
    let data = this.backendService.getService(Rbac.role).subscribe((res: any) => {
      this.roleList = res.data;
      console.log(this.roleList);
    });
    this.subscription.push(data);
  }

  openModel(content: any) {
    this.modal.open(content, { backdrop: 'static' });
    this.roleForm.reset();
  }

  assignPermissions(content: any, roleIndex: any) {
    this.permissionList = [];
    this.addPermissions();
    this.modal.open(content, { backdrop: 'static' });
    this.currentRole = roleIndex;
    const permissions = this.roleList[roleIndex].permissions;
    console.log(permissions, this.permissionList);

    permissions.forEach((el: any) => {
      const index = this.permissionList.findIndex((ent: any) => ent.entitie === el.entitie);
      if (index > -1) {
        this.permissionList[index]['grantedPermissions'] = el.permissions;
      }
    });

    // this.userForm.reset();
  }

  closeModel() {
    this.modal.dismissAll();
  }

  clickPermission(data: any) {
    // console.log(data);
    // this.selectedRoles.push(data);
    console.log(this.grantedPermissions, this.permissionList);
    // data.target.value = '';
  }

  savePermissions() {
    this.closeModel();
    let role = this.roleList[this.currentRole];
    const permissions = this.permissionList.map((el: any) => {
      return {
        entitie: el.entitie,
        permissions: el.grantedPermissions || []
      };
    });
    role.permissions = permissions;
    console.log(role);

    let api = this.backendService.putService(Rbac.role, role, role._id).subscribe((res: any) => {
      this.roleList[this.currentRole] = role;
    });
    this.subscription.push(api);
  }

  save(data: any) {
    this.closeModel();
    let api = this.backendService.postService(Rbac.role, data).subscribe((res: any) => {
      this.roleList = [...this.roleList, data];
    });
    this.subscription.push(api);
  }
}
