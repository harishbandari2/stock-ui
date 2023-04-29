import { Injectable } from '@angular/core';
import { BackendService } from '@app/services';
import * as _ from 'lodash';
import { Flow, Apps, Components } from '@app/consts/api.consts';
import { MapService } from '@app/services/mapper.service';
import { FormGroup } from '@angular/forms';
import { NxInitFormService } from '@app/services/nx-init-form.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  public flow: any = {};
  public flowId: string;
  public openAppPanel = false;
  public lastSave: string = null;
  public configNode: any = {};
  public activeNode: any = {};
  public currentNode: any = {
    order: null,
    index: null,
    parent: null
  };
  public configForm: FormGroup;
  public showConfig = false;

  public errorComponents: {} = {};
  public requiredMappingKeys: {} = { 'condition/field': true, 'condition/value': true };
  public globalFlowError: any;

  constructor(
    private backendService: BackendService,
    public nxInitFormService: NxInitFormService,
    public mapper: MapService
  ) {}

  ///// Add node to tree ////

  openApps(order: number, index: number, parent: any) {
    this.openAppPanel = true;
    if (order) {
      this.currentNode.parent = parent;
      this.currentNode.order = order;
      this.currentNode.index = index;
    }

    // this.assignOrder(index, parent);
  }

  assignOrder(index: number, parent: any) {
    if (parent) {
      if (!index && !parent.children) {
        this.currentNode.order = 1;
      } else if (!index && parent.children) {
        this.currentNode.order = parent.children[0].order / 2;
      } else if (parent.children[index]) {
        this.currentNode.order = (parent.children[index - 1].order + parent.children[index].order) / 2;
      } else this.currentNode.order = parent.children[index - 1].order + 1;
    } else {
      if (!index) {
        this.currentNode.order = 1;
      } else if (this.flow.node[index]) {
        this.currentNode.order = (this.flow.node[index - 1].order + this.flow.node[index].order) / 2;
      } else this.currentNode.order = this.flow.node[index - 1].order + 1;
    }

    this.currentNode.index = index;
    console.log(this.currentNode);
  }

  addNode(action: any, component: any, flowId: string) {
    // let nodeData = _.cloneDeep(action);
    let componentData = _.cloneDeep(component);
    // nodeData.baseURL = componentData.baseUrl;
    let newNode: any = {};
    // delete nodeData.input;
    // delete nodeData.output;
    // newNode.action = nodeData;
    // delete componentData.actions;
    componentData.applicationId;
    newNode.component = componentData;
    newNode.projectId = flowId;
    newNode.order = this.currentNode.order;
    if (componentData.children) newNode.children = componentData.children;
    this.openAppPanel = false;

    return newNode;
  }

  removeNode(node: any, parent: any): void {
    if (parent) parent.children = parent.children.filter((el: any) => el.id !== node.id);
    else this.flow.node = this.flow.node.filter((item: any) => item.id !== node.id);
    let item = this.backendService.deleteService(Flow.nodes, node.id).subscribe((res: any) => {});
    if (node.children) {
      node.children.forEach((el: any) => {
        let item = this.backendService.deleteService(Flow.nodes, el.id).subscribe((res: any) => {});
      });
    }
    let item2 = this.backendService
      .patchService(Flow.flows, { node: this.flow.node }, this.flow.id)
      .subscribe((res: any) => {
        this.clearMaps();
      });
  }

  clearMaps() {
    this.mapper.clearMaps();
  }

  /////////// Node config ////////

  nodeConfig(node: any, body: any) {
    this.showConfig = true;
    this.activeNode = node;
    this.configNode = _.cloneDeep(node);
    this.lastSave = null;
    this.configNode.actionObjects = [];
    // this.patchConfig(this.configNode);
    this.clearMaps();
    this.getOutputs(body);
    if (this.configNode.component.applicationId) this.getConnections();
    if (this.configNode.action.hasObjects) this.getApis();
    else if (this.configNode.action.hasPlugs) this.getConnectors();
    else if (node.input) this.configNode.outputNodes = node.input ? JSON.parse(node.input) : [];
    else if (this.configNode.action.id) this.getAction();
  }

  patchConfig(res: any) {
    const config = res.config ? JSON.parse(res.config) : {};
    this.configNode.config = config;
    this.configNode.action = res.action;
    this.configNode.connectionId = res.connectionId;
    // if (this.configNode.action.configType == 'form') this.initForms(config[this.configNode.component.name]);
    this.mapper.sinkKeys = config;
    // if (res.input) this.configNode.outputNodes = JSON.parse(res.input);
    setTimeout(() => {
      // const firstRoot = this.tree.treeModel.roots[0];
      // firstRoot.expand();

      this.mapper.mapSinkKeys.next(config);
    }, 200);
  }

  getConnections() {
    this.backendService
      .getService(Apps.applications, this.configNode.component.applicationId + `/connections`)
      .subscribe(res => (this.configNode.connections = res));
  }

  getAction() {
    this.backendService.getService(Components.actions, this.configNode.action.id).subscribe((res: any) => {
      let config = res.config ? JSON.parse(res.config) : {};
      if (this.configNode.action.configType == 'form') {
        this.configNode.outputNodes = res.input ? JSON.parse(res.input) : {};
        this.initForms(this.configNode.config ? this.configNode.config[this.configNode.component.name] : false);
      } else if (!this.configNode.outputNodes || this.configNode.outputNodes.length == 0) {
        this.configNode.outputNodes = res.input ? JSON.parse(res.input) : [];
        this.changeConnection(this.configNode.connectionId);
      }
    });
  }

  getApis() {
    this.backendService.getService(Components.actions, this.configNode.action.id + `/actionObjects`).subscribe(res => {
      this.configNode.actionObjects = res;
      this.configNode.action.apiName ? this.changeObject(this.configNode.action.apiName) : null;
    });
  }

  getConnectors() {
    this.backendService.getService('/applications', this.configNode.component.applicationId).subscribe((res: any) => {
      this.configNode.connectors = res.connectors;
      this.configNode.action.connectorId ? this.changeConnector(this.configNode.action.connectorId) : null;
    });
  }

  getOutputs(body: any) {
    const data: any = {
      output: body
    };
    this.backendService.postService('/pipeline', data).subscribe((res: any) => {
      let output: any = [];
      res.output.forEach((el: any) => {
        if (el.name === 'ActionObjects') {
          el.data.forEach((data: any) => (output = [...output, ...JSON.parse(data.responseStructure || [])]));
        } else if (el.name === 'Connection') {
          el.data.forEach((data: any) => (output = [...output, ...JSON.parse(data.structure || [])]));
        } else el.data.forEach((data: any) => (output = [...output, ...(data.output ? JSON.parse(data.output) : [])]));
      });
      this.configNode.inputNodes = output;
      this.mapper.sinkKeys = this.activeNode.config ? JSON.parse(this.activeNode.config) : {};
      setTimeout(() => {
        // const firstRoot = this.tree.treeModel.roots[0];
        // firstRoot.expand();
        this.mapper.mapSinkKeys.next(this.mapper.sinkKeys);
      }, 500);
    });
  }

  changeObject(data: string) {
    const config = this.configNode.actionObjects.filter((el: any) => el.apiName === data)[0];
    setTimeout(() => {
      this.configNode.outputNodes = config.input ? JSON.parse(config.input) : [];
      this.configNode.action.actionType = config.actionType;
      this.configNode.action.apiId = config.id;
      this.configNode.action.configType = config.configType;
      this.configNode.action.resourceURL = config.resourceURL;
      this.activeNode.action.restMethod = config.restMethod ? config.restMethod.toUpperCase() : null;
      // this.configNode.component.appType = 'rest';
    });
  }

  changeConnector(data: string) {
    const config = this.configNode.connectors.filter((el: any) => el.id === data)[0];
    setTimeout(() => {
      this.configNode.query = config.sql;
      this.configNode.outputNodes = config.input ? JSON.parse(config.input) : [];
      this.activeNode.plugName = config.name;
    });
  }

  changeConnection(data: any) {
    if (data && !this.configNode.component.name.includes('Parser')) return;
    else if (data && this.configNode.action.name == 'Write') {
      let connection = this.configNode.connections.filter((el: any) => el.id == data)[0];
      this.configNode.outputNodes = connection && connection.structure ? JSON.parse(connection.structure) : [];
    } else {
      if (this.configNode.component.name.includes('Xml')) {
        this.configNode.action.actionType = 'producer';
        this.configNode.action.configType = 'tree';
        this.configNode.action.baseURL = 'http://localhost:3000/api';
        this.configNode.action.resourceURL = '/getXML';
        this.configNode.action.restMethod = 'POST';
      }
    }
  }

  initForms(data?: any) {
    if (data) {
      this.configForm = this.nxInitFormService.toFormGroup(this.configNode.outputNodes.configuration.groups, data);
    } else this.configForm = this.nxInitFormService.toFormGroup(this.configNode.outputNodes.configuration.groups, {});
  }

  ////save config

  saveNodeData() {
    if (this.configNode.action.configType == 'form') {
      this.activeNode.config = JSON.stringify({ [this.configNode.component.name]: this.configForm.value });
    } else {
      let mapping = {
        maps: this.mapper.sinkKeys.maps,
        transformers: this.mapper.sinkKeys.transformers
      };
      if (this.configNode.query) this.activeNode.query = this.configNode.query;
      this.activeNode.config = JSON.stringify(mapping);
      if (this.configNode.component.name == 'If') this.activeNode.expression = this.formExp(mapping.maps);
    }

    console.log(this.flow.node);

    let item = this.backendService.patchService(Flow.flows, { node: this.flow.node }, this.flow.id).toPromise();

    // this.activeNode.config =

    // console.log(this.flow.node, nodeConfig.config);

    // let item = this.backendService.patchService(Flow.nodes, nodeConfig, this.configNode.id).subscribe(
    //   (res: any) => {
    //     if (res) this.lastSave = 'Last save Success';
    //     // this.backendService.patchService(Flow.flows, { node: this.flow.node }, this.flow.id).toPromise();
    //   },
    //   err => (this.lastSave = 'Last save Failed')
    // );
  }

  formExp(node: any) {
    let express: string = '';
    this.configNode.outputNodes[0].children[0].children.forEach((el: any) => {
      node[el.key].forEach((exp: any) => {
        if (exp.type === 'map') {
          let key = `%{${exp.source.path}}%`;
          express = express + key;
        } else express = express + exp.target.value;
      });
    });
    return express;
  }
}
