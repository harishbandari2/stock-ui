import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from '@app/services';
import { TreeComponent, ITreeState } from 'angular-tree-component';
import * as _ from 'lodash';
import { Apps, Utils } from '@app/consts/api.consts';
import { HttpClient } from '@angular/common/http';
import { MapService } from '@app/services/mapper.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-connector-edit',
  templateUrl: './connector-edit.component.html',
  styleUrls: ['./connector-edit.component.scss']
})
export class ConnectorEditComponent implements OnInit {
  @ViewChild('tree', { static: false }) treeComponent: TreeComponent;

  stateTree: ITreeState;
  public connector: any;
  public showConfig: boolean = false;
  public showLarge: boolean = false;
  public showLogic: boolean = false;
  public appId: string = null;
  public sql: string;
  public connection: any;
  activeNode: any = null;
  configForm: FormGroup;
  options: any = {
    actionMapping: {
      keys: {
        32: null
      }
    }
    // nodeHeight: (node: TreeNode) => console.log(node),
  };

  mappingFields: any = {
    inputNodes: [],
    outputNodes: [],
    sql: ''
  };
  public connectors: any = [];
  public input: any = [];
  public output: any = [];
  public where: any = [];
  public nodes: any = [];

  public db: any = {
    dataBase: [],
    actions: ['select', 'insert', 'delete', 'update'],
    tables: [],
    columns: []
  };
  public connections: any = [];
  operators = ['=', '<', '>'];

  public qObject: any = {
    type: 'select',
    fields: [],
    sort: {}
  };

  txtQueryChanged: Subject<any> = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private backendService: BackendService,
    private fb: FormBuilder,
    public mapper: MapService
  ) {
    this.route.params.subscribe(params => {
      this.appId = params['id'];
      // this.getConnections(this.appId);
      this.createFrom();
    });
    this.createFrom();
    this.getMappingFields();

    this.txtQueryChanged.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((data: any) => {
      console.log(this.mapper.mappingConfig);

      this.mapper.mappingConfig[this.activeNode.key] = data;

      if (data.target === 'fields') {
      }

      // api call
    });
  }

  ngOnInit() {
    this.configForm.get('applicationId').setValue(this.appId);
    console.log(this.mappingFields);
    this.mapper.sinkKeys = { maps: {}, transformers: {} };

    // this.getConnections(this.appId);
  }

  getConnections(id: any) {
    let item = this.backendService.getService('/applications', id).subscribe((res: any) => {
      this.connector = res;
      this.connectors = this.connector.connectors;
      this.connections = this.connector.connections;
    });
  }

  getMappingFields() {
    this.mappingFields.outputNodes = [
      {
        key: 'fields',
        title: 'fields'
        // required:true
      },
      {
        key: 'sort',
        title: 'sort'
        // required:true
      },
      {
        key: 'filters',
        title: 'Filters',
        list: [],
        type: 'conditionGroup',
        children: [
          // {
          //   key: 'filters/fields',
          //   title: 'fields',
          //   // required:true
          // },
          // {
          //   key: 'filters/operator',
          //   title: 'operator',
          //   list: [{name:'==',value:'=='}, {name:'>',value:'>'}],
          // },
          // {
          //   key: 'filters/value',
          //   title: 'value',
          //   // required:true
          // }
        ]
        // list: [{name:'==',value:'=='}, {name:'>',value:'>'}],
      }
    ];
    this.mappingFields.inputNodes = [
      {
        key: 'users',
        title: 'users',
        // type: 'condition',
        children: [
          {
            key: 'users/firstname',
            title: 'firstname'
          },

          {
            key: 'users/lastname',
            title: 'lastname'
          },
          {
            key: 'users/age',
            title: 'age'
          }
        ]
      }
    ];
    // const maps = JSON.parse(localStorage.getItem('mapping'));
    // if (maps) this.mapper.mappingConfig = maps
  }

  addCondition(node: any) {
    console.log(node);
    if (!node) {
      //outside
      let counter = this.mappingFields.outputNodes.length;
      counter = counter + 1;

      let condition: any = {
        key: 'condition' + counter,
        title: 'condition' + counter,
        type: 'condition',
        // list: [],
        children: [
          {
            key: `condition${counter}/field`,
            title: 'field'
          },
          {
            key: `condition${counter}/operator`,
            title: 'operator',
            list: [
              { name: '==', value: '==' },
              { name: '>', value: '>' }
            ]
          },
          {
            key: `condition${counter}/value`,
            title: 'value'
          }
        ]
      };
      this.mappingFields.outputNodes.push(condition);
      // node.parent.data.children.push(condition);
    }

    //if inside conditionGroup
    else {
      let counter = node.data.children.length;
      if (counter < 1) {
        node.data.list = [
          { name: 'AND', value: 'AND' },
          { name: 'OR', value: 'OR' }
        ];
        this.mapper.mappingConfig['filters'] = 'AND';
      }
      counter = counter + 1;
      let condition = {
        key: `${node.data.key}/condition${counter}`,
        title: 'condition' + counter,
        type: 'condition',
        // list: [{name:'AND',value:'AND'}, {name:'OR',value:'OR'}],
        children: [
          {
            key: `${node.data.key}/condition${counter}/field`,
            title: 'field'
          },
          {
            key: `${node.data.key}/condition${counter}/operator`,
            title: 'operator',
            list: [
              { name: '==', value: '==' },
              { name: '>', value: '>' }
            ]
          },
          {
            key: `${node.data.key}/condition${counter}/value`,
            title: 'value'
          }
        ]
      };

      node.data.children.push(condition);
    }
    this.treeComponent.treeModel.update();
  }

  addconditionGroup(node: any) {
    console.log(node);
    if (!node) {
      //outside
      let counter = this.mappingFields.outputNodes.length;
      counter = counter + 1;
      let condition: any = {
        key: `conditionGroup${counter ? counter : ''}`,
        title: `conditionGroup${counter ? counter : ''}`,
        type: 'conditionGroup',
        list: [
          { name: 'AND', value: 'AND' },
          { name: 'OR', value: 'OR' }
        ],
        children: []
      };
      this.mappingFields.outputNodes.push(condition);
    } else {
      let counter = node.data.children.length;
      counter = counter + 1;
      let condition: any = {
        key: `${node.data.key}/condition${counter}`,
        title: 'conditionGroup' + counter,
        type: 'conditionGroup',
        list: [
          { name: 'AND', value: 'AND' },
          { name: 'OR', value: 'OR' }
        ],
        children: []
      };

      node.data.children.push(condition);
      this.mapper.mappingConfig[condition.key] = 'AND';
      console.log(node);
      // this.mappingFields.outputNodes = [...this.mappingFields.inputNodes]
    }
    this.treeComponent.treeModel.update();
  }

  adjustPatches(event: Event) {
    this.mapper.getUpdatedSVGPaths();
    let currentTop = (event.target as HTMLElement).scrollTop;
    // if (this.prevTop !== currentTop) {
    //   this.prevTop = currentTop;
    // }
    // if (this.prevTop >= 176) this.prevTop = 176;
    let scrollLeft = (event.target as HTMLElement).scrollLeft;
    this.mapper.outputAreaScrollLeftPostion = scrollLeft;
  }

  toggleExpanded(node: any, type: string) {
    if (!node.isExpanded) {
      if (type == 'source') this.mapper.updateSourcePoint(node.node.data.key);
      else this.mapper.updateTargetPoint(node.node.data.key);
      setTimeout(() => {
        this.mapper.showMappingLineClick();
      });
    } else {
      setTimeout(() => {
        this.mapper.showMappingLineClick();
      });
    }
  }

  changedText(content: any, node: any) {
    console.log(content, node);
    this.activeNode = node;

    this.txtQueryChanged.next(content);

    // else this.mapper.mappingConfig[this.activeNode.key] = this.mapper.mappingConfig[this.activeNode.key].filter((el:any)=> el.path);
    // this.modal.open(content, { backdrop: 'static' });
    // this.backendService.getService(Transformer.transformerTypes).subscribe((res: any) => {
    //   this.transformers = res;
    // });
  }

  // changeOperator(op:string) {
  //   console.log(op);

  // }

  onAdd(data: any) {
    // console.log(data);
    // if(!data.added.path) data.tags = data.tags.filter((el:any)=> el.path);
  }

  nodeClick(key: any) {
    if (!this.mapper.mappingConfig[key]) this.mapper.mappingConfig[key] = ' ';
    // this.activeNode = node.data;
    // let setValue = {
    //   type: 'setValue',
    //   target: {
    //     path: node.data.key,
    //     title: node.data.title,
    //     value: ''
    //   }
    // };
    // if (!this.mapper.sinkKeys['maps']) this.mapper.sinkKeys['maps'] = {};
    // let path = this.mapper.sinkKeys['maps'][node.data.key];
    // if (!path) {
    //   this.mapper.sinkKeys['maps'][node.data.key] = [setValue];
    // }
  }

  changeConnection(id: any) {
    const connector = this.connections.filter((el: any) => el.id === id)[0];
    if (this.connector.name === 'Salesforce') {
      this.getSfObjects(connector);
    } else this.getDatabase(connector);
  }

  changeAction(id: string) {
    console.log(id);
    this.qObject['type'] = id;
  }

  changeDB(data: any) {
    const tables = this.db.dataBase.filter((el: any) => el.name === data)[0];
    this.db.tables = tables.tables;
    if (this.configForm.get('table').value) this.changeTable(this.configForm.get('table').value);
  }

  changeTable(table: any) {
    let data: any = {};
    data.schemaName = this.configForm.get('database').value;
    data.tableName = table;
    this.backendService.postService(`/getdbinfo/columns`, data).subscribe((res: any) => {
      this.db.columns = res;
      this.patchTree(this.nodes);
    });
  }

  showConfigClick() {
    this.showConfig = true;
    if (this.configForm.get('connection').value) this.changeConnection(this.configForm.get('connection').value);
  }

  activeConnect(conn: any) {
    this.configForm.patchValue(conn, { onlySelf: true });
    this.input = JSON.parse(conn.input || []);
    this.output = JSON.parse(conn.output || []);
    const config = JSON.parse(conn.config || {});
    console.log(config);
    this.where = config.where;
    if (this.where.length > 0) this.showLogic = true;
    this.nodes = config.nodes;
  }

  patchTree(nodes: any) {
    setTimeout(() => {
      this.treeComponent.treeModel.update();
      const selectedLeafNodeIds = {};
      nodes.forEach((el: any) => {
        selectedLeafNodeIds[el] = true;
      });
      this.stateTree = {
        ...this.stateTree,
        selectedLeafNodeIds
      };
    }, 10);
  }

  getSfObjects(connector: any) {
    this.backendService.getDataService(`/getsfobjects`, null).subscribe((res: any) => {
      console.log(res);
      this.db.tables = res;
      if (this.configForm.get('database').value) this.changeObject(this.configForm.get('database').value);
    });
  }

  changeObject(sobject: any) {
    console.log(sobject);
    this.backendService.postService(`/getsfobjects/columns`, { type: sobject }).subscribe((res: any) => {
      console.log(res);
      this.db.columns = res;
      this.patchTree(this.nodes);
    });
  }

  getDatabase(connector: any) {
    const config = JSON.parse(connector.config);
    let data = config.general;
    data.dbServerName = 'postgres';
    data.connectionName = 'myTestPlug';
    this.connection = data;
    this.backendService.getDataService(`/getdbinfo`, null).subscribe(
      (res: any) => {
        if (res) {
          data = res;
          const grouped = _.mapValues(_.groupBy(data, 'schema'), clist => clist.map(data => _.omit(data, 'schema')));
          const sch = Object.keys(grouped);
          sch.forEach(el => {
            let db = {
              name: el,
              tables: grouped[el]
            };
            this.db.dataBase.push(db);
          });
        }
        if (this.configForm.get('database').value) this.changeDB(this.configForm.get('database').value);
      }
      // err => (this.lastTest = 'Last test Failed')
    );
  }

  clickNode(data: any) {
    this.treeComponent;
  }

  showLogicBox() {
    this.showLogic = true;
  }

  createFrom() {
    this.configForm = this.fb.group({
      id: [null],
      name: [null, Validators.required],
      description: [null, Validators.required],
      connection: [null, Validators.required],
      action: [null, Validators.required],
      database: [null, Validators.required],
      table: [null, Validators.required],
      sql: [null],
      input: [null],
      output: [null],
      config: [null],
      applicationId: [null, Validators.required]
    });
  }

  saveData() {
    this.input = [];
    const form = this.configForm.value;
    let nodes: any = [];
    if (this.treeComponent) {
      nodes = this.treeComponent.treeModel.selectedLeafNodes;
      if (this.connector.name !== 'Salesforce') {
        this.genarateTree(form, nodes);
        this.genarateSql(form, nodes);
      } else {
        this.genarateSfTree(form, nodes);
        if (form.action == 'select') this.genarateSoQl(form, nodes);
      }
    }
  }

  genarateSfTree(form: any, nodes: any) {
    console.log(nodes, form);
    this.input = [];
    this.output = [];
    if (form.action === 'insert' || form.action === 'update') {
      let input: any = {
        title: form.database,
        key: `/${form.database}`,
        children: []
      };
      this.output = _.cloneDeep([input]);
      let childs: any = [];
      nodes.forEach((el: any) => {
        childs.push({ title: el.data.column_name, key: `${input['key']}/${el.data.column_name}` });
      });
      input.children = childs;
      this.input = [...this.input, ...[input]];
      this.attachIo();
    } else if (form.action === 'select') {
      let input: any = {
        title: form.database,
        key: `/${form.database}`,
        children: [
          {
            title: 'where',
            key: `/${form.database}/where`,
            children: []
          }
        ]
      };

      this.input = _.cloneDeep([input]);
      if (this.where.length > 0) {
        this.where.forEach((el: any) => {
          if (el.element && el.operator) {
            this.input[0].children[0].children.push({
              title: `${el.element}[${el.operator}]`,
              key: `/${form.database}/where/${el.element}`
            });
          }
        });
      }
      let childs: any = [];
      nodes.forEach((el: any) => {
        childs.push({ title: el.data.column_name, key: `${input.children[0]['key']}/${el.data.column_name}` });
      });
      this.output = [...this.output, ...[input]];
      this.output[0].children = childs;
    } else if (form.action === 'delete') {
      let input: any = {
        title: form.database,
        key: `/${form.database}`,
        children: [
          {
            title: 'where',
            key: `/${form.database}/where`,
            children: []
          }
        ]
      };
      this.input = _.cloneDeep([input]);
      if (this.where.length > 0) {
        this.where.forEach((el: any) => {
          if (el.element && el.operator) {
            this.input[0].children[0].children.push({
              title: `${el.element}`,
              key: `/${form.database}/where/${el.element}`
            });
          }
        });
      }
      this.output = [input];
      this.attachIo();
    }
    console.log(this.input, this.output);
  }

  genarateTree(form: any, nodes: any) {
    console.log(nodes, form);
    this.input = [];
    this.output = [];
    if (form.action === 'insert' || form.action === 'update') {
      let input: any = {
        title: form.database,
        key: `/${form.database}`,

        children: [
          {
            title: form.table,
            key: `/${form.database}/${form.table}`,
            children: []
          }
        ]
      };
      this.output = _.cloneDeep([input]);
      let childs: any = [];
      nodes.forEach((el: any) => {
        childs.push({ title: el.data.column_name, key: `${input.children[0]['key']}/${el.data.column_name}` });
      });
      if (this.connector.name === 'Salesforce') {
        input.children = childs;
      } else input.children[0].children = childs;
      this.input = [...this.input, ...[input]];
      this.attachIo();

      //////where/////////////////////////////////////////////
      if (this.where.length > 0 && form.action === 'update') {
        this.input[0].children[0].children.push({
          title: 'where',
          children: [],
          key: `${input.children[0]['key']}/where`
        });
        this.where.forEach((el: any) => {
          if (el.element && el.operator) {
            this.input[0].children[0].children[childs.length - 1].children.push({
              title: `${el.element}[${el.operator}]`,
              key: `${input.children[0]['key']}/where/${el.element}`
            });
          }
        });
      }
    } else if (form.action === 'select') {
      let input: any = {
        title: form.database,
        key: `/${form.database}`,
        children: [
          {
            title: form.table,
            key: `/${form.database}/${form.table}`,
            children: [
              {
                title: 'where',
                key: `/${form.database}/${form.table}/where`,
                children: []
              }
            ]
          }
        ]
      };

      let output: any = {
        title: form.name,
        key: `/${form.name}`,
        children: [
          {
            title: 'data',
            key: `/${form.name}/data[]`,
            children: []
          }
        ]
      };
      this.input = _.cloneDeep([input]);
      if (this.where.length > 0) {
        this.where.forEach((el: any) => {
          if (el.element && el.operator) {
            if (this.connector.name === 'Salesforce') {
              input.children = childs;
            } else {
              this.input[0].children[0].children[0].children.push({
                title: `${el.element}[${el.operator}]`,
                key: `/${form.database}/${form.table}/where/${el.element}`
              });
            }
          }
        });
      }
      let childs: any = [];
      nodes.forEach((el: any) => {
        childs.push({ title: el.data.column_name, key: `/${form.name}/data[]/${el.data.column_name}` });
      });
      this.output = [...this.output, ...[output]];
      this.output[0].children[0].children = childs;
    } else if (form.action === 'delete') {
      let input: any = {
        title: form.database,
        children: [
          {
            title: form.table,
            children: [
              {
                title: 'where',
                children: []
              }
            ]
          }
        ]
      };
      this.input = _.cloneDeep([input]);
      if (this.where.length > 0) {
        this.where.forEach((el: any) => {
          if (el.element && el.operator) {
            this.input[0].children[0].children[0].children.push({
              title: `${el.element}[${el.operator}]`
            });
          }
        });
      }
      this.output = [input];
    }
    console.log(this.output);
  }

  genarateSql(form: any, nodes: any) {
    let sqlParams: any;
    const action = form.action;
    switch (form.action) {
      case 'select':
        sqlParams = {
          $from: form.database + '.' + form.table,
          $fields: []
        };
        nodes.forEach((el: any) => sqlParams.$fields.push({ $field: el.data.column_name }));
        break;
      case 'insert':
        sqlParams = {
          $insert: form.database + '.' + form.table,
          $values: {}
        };
        nodes.forEach((el: any) =>
          Object.assign(sqlParams.$values, { [el.data.column_name]: `$[${form.table + '.' + el.data.column_name}]` })
        );
        break;
      case 'update':
        sqlParams = {
          $update: form.database + '.' + form.table,
          $set: {}
        };
        nodes.forEach((el: any) =>
          Object.assign(sqlParams.$set, { [el.data.column_name]: `$[${form.table + '.' + el.data.column_name}]` })
        );
        break;
      default:
        sqlParams = {
          $delete: form.table,
          $set: {}
        };
        break;
    }
    const data = {
      action: action,
      data: sqlParams
    };

    let where: any = [];
    if (this.where.length > 0) {
      console.log(this.where);
      this.where.forEach((el: any) => {
        if (el.element && el.operator) {
          where.push({ [el.element]: `$[${form.table + '.where.' + el.element}]` });
        }
      });
    }
    data.data.$where = where;

    this.backendService.postService('/getCSV', data).subscribe((res: any) => {
      this.configForm.get('sql').setValue(res);
      this.attachIo();
    });
  }

  genarateSoQl(form: any, nodes: any) {
    let sqlParams: any;
    const action = form.action;
    if (form.action === 'select') {
      sqlParams = {
        $from: form.database,
        $fields: []
      };
      nodes.forEach((el: any) => sqlParams.$fields.push({ $field: el.data.column_name }));
    }

    const data = {
      action: action,
      data: sqlParams
    };

    let where: any = [];
    if (this.where.length > 0) {
      console.log(this.where);
      this.where.forEach((el: any) => {
        if (el.element && el.operator) {
          where.push({ [el.element]: `${el.element}` });
        }
      });
    }
    data.data.$where = where;

    this.backendService.postService('/getCSV', data).subscribe((res: any) => {
      this.configForm.get('sql').setValue(res);
      this.attachIo();
    });
  }

  attachIo() {
    this.configForm.get('input').setValue(JSON.stringify(this.input));
    this.configForm.get('output').setValue(JSON.stringify(this.output));
    const config = {
      nodes: this.treeComponent.treeModel.selectedLeafNodes.map(el => el.data.column_name),
      where: this.where
    };
    this.configForm.get('config').setValue(JSON.stringify(config));
  }

  addWhere() {
    let where: any = {
      element: null,
      operator: null
    };
    this.where.push(where);
  }

  removeWhere(index: any) {
    this.where.splice(index, 1);
  }

  excuteSql() {
    // this.qObject['fields'] = this.mapper.mappingConfig['fields'].map((el:any) => {
    //   let values =  el.value.split('.');
    //   return {
    //     name:values[1],
    //     table:values[0]
    //   }
    // });

    // this.qObject['table'] = this.qObject['fields'][0].table;

    // this.qObject['sort'] ={}const\

    let data = {};

    for (let key in this.mapper.mappingConfig) {
      if (key.startsWith('filters')) data[key] = this.mapper.mappingConfig[key];
    }
    console.log(data);

    const flat = this.unflatten(data);
    console.log(flat);

    // this.mapper.mappingConfig['sort'].forEach((el:any) => {
    //   let values =  el.value.split('.');
    //   this.qObject['sort'][values[1]] =1
    // });

    this.qObject = {
      table: 'users',
      condition: {
        $or: [
          {
            $and: {
              name: 'John'
            }
          },
          {
            $and: {
              name: 'users.name',
              age: 14,

              $or: {
                name: 'users.name',
                age: 14
              }
            }
          }
        ]
      }
    };
    console.log(this.qObject);
    this.backendService.postService(Utils.convertSql, this.qObject).subscribe((res: any) => {
      this.mappingFields.sql = res;
    });
  }

  unflatten = (obj: any) =>
    Object.keys(obj).reduce((acc, k) => {
      if (k.indexOf('.') !== -1) {
        const keys = k.split('/');
        Object.assign(
          acc,
          JSON.parse(
            '{' +
              keys.map((v, i) => (i !== keys.length - 1 ? `"${v}":{` : `"${v}":`)).join('') +
              obj[k] +
              '}'.repeat(keys.length)
          )
        );
      } else acc[k] = obj[k];
      return acc;
    }, {});

  save() {
    const data = this.configForm.value;

    if (!data.id) {
      this.backendService.postService(Apps.connectors, data).subscribe((res: any) => {});
    } else this.backendService.putService(Apps.connectors, data).subscribe((res: any) => {});
  }
}
