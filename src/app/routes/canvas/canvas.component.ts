import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Apps, Components, Flow } from '../../consts/api.consts';
import { BackendService } from '@app/services';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { MapService } from '@app/services/mapper.service';
import { HttpClient } from '@angular/common/http';
import { CanvasService } from './canvas.service';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {
  public componentList: any = [];
  public flowId: string;
  public flow: any = {};
  public lastTest: string = null;
  public configNode: any = {};
  public transformers: any = [];
  public activeComponentId: string;
  public sideContent: string;
  public currentNode: any = {
    order: null,
    index: null
  };

  activeNode: any = null;
  mappingNode: any;
  clonedNode: any;
  activeTab: string = 'configuration';
  config = { maps: {} };
  rightNodes: any = [];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private modal: NgbModal,
    public mapper: MapService,
    public canvasService: CanvasService,
    private backendService: BackendService,
    private cd: ChangeDetectorRef
  ) {
    this.route.params.subscribe(params => {
      this.flowId = params['id'];
      this.canvasService.flowId = this.flowId;
      this.getNodes(this.flowId);
    });

    this.getComponents();
  }

  ngOnInit() {
    this.mapper.sinkKeys = { maps: {}, transformers: {} };
    // this.getComponents();
  }

  getNodes(id: string) {
    this.flow = {
      name: 'Test flow',
      node: []
    };
    // let item = this.backendService.getService(Flow.flows, id).subscribe((res: any) => {
    //   this.flow = res;
    this.canvasService.flow = this.flow;
    // });
  }

  getComponents() {
    let data = this.backendService.getService(Apps.applications).subscribe((res: any) => {
      this.componentList = res.data;
      console.log(this.componentList);
    });
    // this.subscription.push(data);
  }

  closeModel() {
    this.modal.dismissAll();
  }

  flowClick(data: any) {
    console.log(data);

    const { type, order, index, parent, node } = data;
    this.sideContent = type;
    this.mappingNode = node;
    this.clonedNode = _.cloneDeep(this.flow.node);
    if (!this.mappingNode.action) this.mappingNode.action = {};
    if (!this.mappingNode.connectionId) this.mappingNode.connectionId = ' ';
    console.log(node);

    if (type === 'mapping') {
      this.canvasService.openAppPanel = true;
    } else {
      this.canvasService.openApps(order, index, parent);
    }
    this.cd.markForCheck();
  }

  async addNode(action: any, component: any) {
    let newNode: any = this.canvasService.addNode(action, component, this.flowId);
    const activeNode = this.canvasService.currentNode;
    newNode.id = this.mapper.generateId();
    if (!activeNode.parent) {
      this.flow.node.splice(this.canvasService.currentNode.index, 0, newNode);
    } else {
      if (!isNaN(activeNode.index) && !activeNode.parent.children) {
        activeNode.parent.children = [newNode];
      } else activeNode.parent.children.splice(activeNode.index, 0, newNode);
    }

    this.flow.node = [...this.flow.node];
    this.canvasService.errorComponents[newNode.id] = true;
    // let node: any = await this.backendService.postService(Flow.nodes, newNode).toPromise();
    if (newNode.children) {
      newNode.children.forEach((el: any) => {
        el.parentId = newNode.id;
        delete el.id;
      });
      // let children = await this.backendService.postService(Flow.nodes, newNode.children).toPromise();
      // newNode.children = children;
    }

    let Obj = {
      node: this.flow.node
    };
    // let itemFlow = await this.backendService.patchService(Flow.flows, Obj, this.flow.id).toPromise();
    this.cd.detectChanges();
  }

  changeConnection(event: any) {
    console.log(this.mappingNode);

    if (event) this.mappingNode.component.error['connection'] = false;
    // this.checkforError()
  }

  changeAction(event: any) {
    console.log(this.mappingNode);
    if (event) this.mappingNode.component.error['action'] = false;
    // this.checkforError()
  }

  checkforError() {
    const maps = this.mapper.mappingConfig;
    const keys = this.canvasService.requiredMappingKeys;
    Object.keys(maps).forEach(k => maps[k] == '' && delete maps[k]);
    let keysMissing = false;
    Object.keys(keys).forEach(k => {
      if (!maps[k]) keysMissing = true;
    });
    console.log(maps);

    if (
      Object.keys(this.mappingNode.component.error).every(k => !this.mappingNode.component.error[k]) &&
      !keysMissing
    ) {
      this.canvasService.errorComponents[this.mappingNode.id] = false;
      if (Object.keys(this.canvasService.errorComponents).every(e => !this.canvasService.errorComponents[e])) {
        console.log('here');

        this.canvasService.globalFlowError = false;
      } else this.canvasService.globalFlowError = true;
    } else {
      this.canvasService.errorComponents[this.mappingNode.id] = true;
      this.canvasService.globalFlowError = true;
    }
    console.log(this.mapper.mappingConfig, this.canvasService.requiredMappingKeys, this.canvasService.globalFlowError);
  }

  closeSidePanel() {
    this.canvasService.openAppPanel = !this.canvasService.openAppPanel;
    this.flow.node = [...this.clonedNode];
    this.activeTab = 'configuration';
    this.cd.markForCheck();
  }

  saveConfig() {
    this.checkforError();
    this.clonedNode = _.cloneDeep(this.flow.node);
    this.mapper.mappingConfig = {};
    console.log(this.flow.node);

    // this.canvasService.requiredMappingKeys={};
  }

  clickTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'mapping') {
      // this.activeTab = tab;
    } else {
    }
  }

  identify(index: any, item: any) {
    return item.id;
  }

  openApps(order: number) {
    this.canvasService.openApps(order, 0, undefined);
  }

  clickComponent(item: any) {
    this.activeComponentId = item.id;
  }

  testFlow() {
    this.lastTest = '';
    this.http.post(`http://54.81.103.8:8090/test`, this.flowId).subscribe(
      res => {
        if (res) this.lastTest = 'Last test Success';
        this.mapper.showConfig = true;
        this.canvasService.configNode.isTest = true;
        this.mapper.testData = res;
      },
      err => (this.lastTest = 'Last test Failed')
    );
  }
}

// const ObjectId = (m = Math, d = Date, h = 16, s = (s: any) => m.floor(s).toString(h)) =>
//   s(d.now() / 1000) + ' '.repeat(h).replace(/./g, () => s(m.random() * h));
// console.log(ObjectId());

//////////////////////

// getPipeLine(index: number) {
//   const apiObjects: any = [];
//   const actions: any = [];
//   const parsers: any = [];

//   this.flow.nodes.slice(0, index).forEach((el: any) => {
//     if (el.action.hasObjects) apiObjects.push(el.action.apiName);
//     else if (el.component.name.includes('Parser') && el.action.name === 'Read') parsers.push(el.connectionId);
//     else actions.push(el.action.id);
//   });

//   const apiList = this.prepareApiList(actions, apiObjects, parsers);

//   forkJoin(apiList).subscribe((actions: any) => {
//     let inputNodes: any = [];
//     actions[0].forEach((action: any) => {
//       if (action.output) {
//         inputNodes = [...inputNodes, ...JSON.parse(action.output)];
//       }
//     });

//     let index = 5;

//     if (!this.configNode.action.hasObjects) index = 4;
//     if (actions[index])
//       actions[index].forEach((action: any) => {
//         if (action.responseStructure) {
//           inputNodes = [...inputNodes, ...JSON.parse(action.responseStructure)];
//         }
//       });
//     if (apiList.length >= 6) {
//       actions[5].forEach((action: any) => {
//         if (action.structure) {
//           inputNodes = [...inputNodes, ...JSON.parse(action.structure)];
//         }
//       });
//     }

//     this.configNode.connections = actions[3];
//     this.configNode.inputNodes = inputNodes;
//     let config = actions[2].config ? JSON.parse(actions[2].config) : {};
//     if (actions[2].connection) this.configNode.connection = actions[2].connection;
//     if (this.configNode.action.hasObjects) {
//       this.configNode.actionObjects = actions[4];
//       this.configNode.action.apiName ? this.changeObject(this.configNode.action.apiName) : null;
//     }

//     if (this.configNode.action.configType == 'form') {
//       this.configNode.outputNodes = actions[1].input ? JSON.parse(actions[1].input) : {};
//       this.initForms(config[this.configNode.component.name]);
//     } else {
//       this.configNode.outputNodes = actions[1].input ? JSON.parse(actions[1].input) : [];
//       this.mapper.sinkKeys = config.maps ? config : { maps: {}, transformers: {} };
//       this.changeConnection(this.configNode.connectionId);
//       setTimeout(() => {
//         // const firstRoot = this.tree.treeModel.roots[0];
//         // firstRoot.expand();
//         this.mapper.mapSinkKeys.next(this.mapper.sinkKeys);
//       }, 500);
//     }
//   });
// }
