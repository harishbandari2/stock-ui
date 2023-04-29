import { Injectable } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NxInitFormService {
  configJson: any;
  path: string;
  arrayIndex: number;
  formFields: Subject<any> = new BehaviorSubject<any>({});

  constructor() {}

  toFormGroup(formModel: any, configJson: any) {
    this.configJson = configJson;
    let formGroup = {};
    formModel.forEach((field: any) => {
      this.path = field.name;
      formGroup[field.name] = this.toFormGroupFromArr(field.parameters);
    });
    return new FormGroup(formGroup);
  }

  toFormGroupFromArr(arr: any) {
    return new FormGroup(
      arr.reduce((acc: any, cur: any) => {
        this.path = `${this.path}.${cur.name}`;
        return this.appendFieldFormControlToObject(cur, acc);
      }, {})
    );
  }

  appendFieldFormControlToObject(field: any, obj: any) {
    const get = (p: any, o: any) => p.reduce((xs: any, x: any) => (xs && xs[x] ? xs[x] : null), o);
    if (field.type == 'object') {
      obj[field.name] = this.toFormGroupFromArr(field.parameters);
      this.path = this.path.replace(`.${field.name}`, '');
    } else if (field.type == 'array') {
      let arrayPath = this.path.split('.');
      let value: any = get(arrayPath, this.configJson) || [];
      let fieldParameters: any = _.clone(field.parameters);

      let configValuesArray: any = [];
      value.forEach((rs: any) => {
        let formedArray: any = [];
        fieldParameters.forEach((el: any) => {
          let rowEle = _.clone(el);
          rowEle.defaultValue = rs[el.name];
          formedArray.push(rowEle);
        });
        configValuesArray.push(formedArray);
      });

      field.defaultValue = configValuesArray;

      obj[field.name] = new FormArray(
        field.defaultValue.map((el: any, index: any) => {
          this.arrayIndex = index;
          // this.path = `${this.path}.${index}`;
          return this.toFormGroupFromArr(el);
        })
      );
      this.path = this.path.replace(`.${field.name}`, '');
      this.arrayIndex = null;
    } else if (field.type == 'checkbox') {
      obj[field.name] = this.toFormGroupFromArr(field.options);
      this.path = this.path.replace(`.${field.name}`, '');
    } else {
      // if (this.arrayIndex >= -1) {
      //   this.path = this.path.replace(`.${this.arrayIndex}`, '');
      // }
      let value = '';
      let arrayPath = this.path.split('.');
      if (this.arrayIndex > -1) {
        arrayPath.splice(arrayPath.length - 1, 0, `${this.arrayIndex}`);
      } else {
        value = get(arrayPath, this.configJson);
      }

      this.path = this.path.replace(`.${field.name}`, '');
      let toSet = field.defaultValue;
      if (value !== null) {
        toSet = value.toString().trim() ? value : field.defaultValue ? field.defaultValue : null;
      }
      if (field.required) {
        if (field.validations instanceof Array) {
          field.validations.push({ key: 'required' });
        } else {
          field.validations = [{ key: 'required' }];
        }
      }
      obj[field.name] = new FormControl(
        toSet,
        (field.validations || []).map((v: any) => {
          switch (v.key) {
            case 'required':
              return Validators.required;
            case 'minlength':
              return Validators.minLength(v.value);
            case 'maxlength':
              return Validators.maxLength(v.value);
            case 'email':
              return Validators.email;
            case 'pattern':
              return Validators.pattern(v.value);
            case 'number':
              return Validators.pattern('[0-9]+');
          }
        })
      );
    }
    return obj;
  }

  findValueByKey(object: any, field: any) {
    let paths: any = [];

    function getPaths(obj: any, path: any) {
      if (obj instanceof Object && !(obj instanceof Array)) {
        for (var k in obj) {
          paths.push(path + '.' + k);
          getPaths(obj[k], path + '.' + k);
        }
      }
    }

    getPaths(object, '');
    return paths
      .map(function(p: any) {
        return p.slice(p.lastIndexOf('.') + 1) == field ? p.slice(1) : '';
      })
      .sort(function(a: any, b: any) {
        return b.split('.').length - a.split('.').length;
      })[0];
  }

  findByKey(object: any): any {
    var result = null;
    if (object instanceof Array) {
      for (var i = 0; i < object.length; i++) {
        result = this.findByKey(object[i]);
        if (result) {
          break;
        }
      }
    } else {
      for (var prop in object) {
        if (prop == 'id') {
          if (object[prop] == 1) {
            return object;
          }
        }
        if (object[prop] instanceof Object || object[prop] instanceof Array) {
          result = this.findByKey(object[prop]);
          if (result) {
            break;
          }
        }
      }
    }
    return result;
  }
}
