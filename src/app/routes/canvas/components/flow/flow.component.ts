import { Component, OnInit, Input, ViewChild, Output, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CanvasService } from '../../canvas.service';
import { TreeComponent } from 'angular-tree-component';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'app-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowComponent implements OnInit {
  @ViewChild('tree', { static: true }) treeComponent: TreeComponent;
  @Input() node: any;
  @Output() onClick = new EventEmitter();

  expand = {};
  countries: Array<any> = [];
  componetPath: Array<any> = [];

  constructor(public canvasService: CanvasService, private cd: ChangeDetectorRef) {}

  ngOnInit() {}

  expandNode(node: any) {
    if (this.expand[node.id]) {
      delete this.expand[node.id];
    } else this.expand[node.id] = true;
    console.log(this.expand);
    this.cd.markForCheck();
  }

  openApps(index: number, parent: any, node: any) {
    this.treeComponent.treeModel.update();
    const tNode = this.treeComponent.treeModel.getNodeById(node.id);

    let order = null;

    const parentComponents = ['If', 'else', 'loop'];

    if (parentComponents.includes(tNode.data.component.name)) {
      if (tNode.data.children && tNode.data.children[index]) {
        order = (0 + tNode.data.children[index].order) / 2;
      } else order = 1;
    } else if (tNode.parent.data.children[index]) {
      order = (tNode.data.order + tNode.parent.data.children[index].order) / 2;
    } else order = tNode.data.order + 1;

    if (parentComponents.includes(node.component.name) && !parent) {
      parent = node;
    }

    tNode.focus();

    const data = {
      type: 'add component',
      index: index,
      order: order,
      node: node,
      parent: parent
    };
    this.cd.detectChanges();
    this.onClick.emit(data);
  }

  openMapping(node: any) {
    const data = {
      type: 'mapping',
      node: node
      // parent:parent
    };
    const tNode = this.treeComponent.treeModel.getNodeById(node.id);
    console.log(tNode);
    this.componetPath = [];
    this.getPipeLineData(tNode);
    console.log(this.componetPath);

    this.onClick.emit(data);
  }

  getPipeLineData(node: any) {
    // console.log(node.parent);

    if (node.parent.data.virtual) {
      node.parent.data.children.forEach((el: any, index: number) => {
        if (index < node.index) {
          this.componetPath.splice(index, 0, el.component.name);
        }
      });
      return;
    } else {
      node.parent.data.children.forEach((el: any, index: number) => {
        if (index < node.index) {
          this.componetPath.splice(index, 0, el.component.name);
        }
      });
      if (node.parent.parent) this.getPipeLineData(node.parent);
    }
  }

  removeNode(node: any, parent: any): void {
    console.log(node, parent);
    // this.canvasService.removeNode(node, parent);
  }

  identify(index: any, node: any) {
    return node.id;
  }

  ////////////////// Node config //////////////////

  nodeConfig(node: any, index: number, parent: any) {
    console.log(node);

    const body: any = {
      ActionObjects: [],
      Action: [],
      Connection: [],
      Connectors: []
    };
    if (parent) {
      this.treeComponent.treeModel.update();
      let nodeTree = this.treeComponent.treeModel.getNodeById(node.id);
      let parentIndex: number;
      nodeTree.path.forEach((el: any, i: number) => {
        let nodeData = this.treeComponent.treeModel.getNodeById(el);
        if (i == 0) parentIndex = nodeData.index;
        if (nodeData.data.children) {
          if (nodeTree.path[i + 2]) this.parseNestedTree(nodeData.data.children, body);
          else this.parseNestedTree(nodeData.data.children.slice(0, index), body);
        }
      });

      let nodes = this.node.slice(0, parentIndex);
      this.parseTree(nodes, body);
    } else {
      let nodes = this.node.slice(0, index);
      this.parseTree(nodes, body);
    }
    // if (node.action) this.canvasService.nodeConfig(node, body);
  }

  parseNestedTree(nodes: any, body: any) {
    nodes.forEach((el: any) => {
      if (el.children) return;
      else if (el.action && el.action.hasObjects && el.action.apiId) body.ActionObjects.push(el.action.apiId);
      else if (el.action && el.action.hasPlugs) body.Connectors.push(el.action.connectorId);
      else if (el.component.name.includes('Parser') && el.action.name === 'Read') body.Connection.push(el.connectionId);
      else if (el.action && el.action.id && !el.action.hasObjects) body.Action.push(el.action.id);
    });
  }

  parseTree(nodes: any, body: any) {
    nodes.forEach((el: any) => {
      if (el.children) this.parseTree(el.children, body);
      else if (el.action && el.action.hasObjects && el.action.apiId) body.ActionObjects.push(el.action.apiId);
      else if (el.action && el.action.hasPlugs) body.Connectors.push(el.action.connectorId);
      else if (el.component.name.includes('Parser') && el.action.name === 'Read') body.Connection.push(el.connectionId);
      else if (el.action && el.action.id && !el.action.hasObjects) body.Action.push(el.action.id);
    });
  }
}
