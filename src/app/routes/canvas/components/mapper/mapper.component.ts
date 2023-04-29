import { Component, Input, OnInit, Pipe, ViewChild, PipeTransform, HostListener } from '@angular/core';
import { MapService } from '@app/services/mapper.service';
import { CanvasService } from '../../canvas.service';
import { IActionMapping, KEYS, TreeComponent, TreeNode, TREE_ACTIONS } from 'angular-tree-component';
import { TagifySettings } from '@yaireo/tagify';
import * as _ from 'lodash';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-mapper',
  templateUrl: './mapper.component.html',
  styleUrls: ['./mapper.component.scss']
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapperComponent implements OnInit {
  // @HostListener('focusout') focusOut() {
  //   console.log("fout",this.activeNode.key);
  //   this.mapper.mappingConfig[this.activeNode.key] = _.cloneDeep(this.changedValue);
  // }

  @ViewChild('tree', { static: false }) private tree: TreeComponent;

  @Input() node: any;
  prevTop = 0;
  activeNode: any = null;
  isTest = false;
  config = { maps: {} };
  rightNodes: any = [];
  showLarge = false;

  mappingFields: any = {
    inputNodes: [],
    outputNodes: []
  };

  options: any = {
    actionMapping: {
      keys: {
        32: null
      }
    }
    // nodeHeight: (node: TreeNode) => console.log(node),
  };

  mixedValue =
    '[[{"id":200, "value":"cartman", "title":"Eric Cartman"}]] and [[gmail]] do not know because he\'s a relic.';
  changedValue = '';
  txtQueryChanged: Subject<string> = new Subject<string>();
  // activeNode:string = ''

  constructor(public mapper: MapService, public canvasMap: CanvasService) {
    this.txtQueryChanged.pipe(debounceTime(1000), distinctUntilChanged()).subscribe((data: any) => {
      console.log(data);

      this.mapper.mappingConfig[this.activeNode.key] = data;
      // api call
    });
  }

  ngOnInit() {
    console.log(this.node);
    this.getMappingFields();
  }

  getMappingFields() {
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
      // {
      //   key: 'conditionset',
      //   title: 'conditionset',
      //   type:'conditionset',
      //   list:['AND','OR'],
      //   children: [

      //   ]
      // },
    ];
    this.mappingFields.outputNodes = [
      {
        key: 'condition',
        title: 'condition',
        type: 'condition',
        list: ['AND', 'OR'],
        children: []
      }
    ];
    // this.mappingFields.outputNodes = this.mappingFields.inputNodes;
    // const maps = JSON.parse(localStorage.getItem('mapping'));
    // if (maps) this.mapper.mappingConfig = maps
  }

  adjustPatches(event: Event) {
    this.mapper.getUpdatedSVGPaths();
    let currentTop = (event.target as HTMLElement).scrollTop;
    if (this.prevTop !== currentTop) {
      this.prevTop = currentTop;
    }
    if (this.prevTop >= 176) this.prevTop = 176;
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

  windowResize() {
    this.showLarge = !this.showLarge;
    setTimeout(() => {
      this.mapper.mapSinkKeys.next(this.mapper.sinkKeys);
    }, 50);
  }

  addCondition(node: any) {
    console.log(node);
    if (!node) {
      //outside
      const counter = this.mappingFields.outputNodes.length;
      let condition = {
        key: 'condition' + counter,
        title: 'condition' + counter,
        type: 'condition',
        list: [
          { name: 'AND', value: 'AND' },
          { name: 'OR', value: 'OR' }
        ],
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

    //if inside conditionset
    else {
      const counter = node.data.children.length;
      let condition = {
        key: `${node.data.key}/condition${counter}`,
        title: 'condition' + counter,
        type: 'condition',
        list: [
          { name: 'AND', value: 'AND' },
          { name: 'OR', value: 'OR' }
        ],
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
    this.tree.treeModel.update();
  }

  addConditionSet(node: any) {
    console.log(node);
    if (!node) {
      //outside
      const counter = this.mappingFields.outputNodes.length;
      let condition: any = {
        key: `conditionset${counter ? counter : ''}`,
        title: `conditionset${counter ? counter : ''}`,
        type: 'conditionset',
        list: ['AND', 'OR'],
        children: []
      };
      this.mappingFields.outputNodes.push(condition);
    } else {
      const counter = node.data.children.length;
      let condition: any = {
        key: `${node.data.key}/condition${counter}`,
        title: 'conditionset' + counter,
        type: 'conditionset',
        list: ['AND', 'OR'],
        children: []
      };
      node.data.children.push(condition);
      console.log(node);

      // this.mappingFields.outputNodes = [...this.mappingFields.inputNodes]
    }
    this.tree.treeModel.update();
  }

  //// Delete map

  deleteMap(key: string, index: number) {
    this.mapper.sinkKeys['maps'][key].splice(index, 1);
    if (this.mapper.sinkKeys['maps'][key].length <= 0) {
      delete this.mapper.sinkKeys['maps'][key];
    } else if (this.mapper.sinkKeys['maps'][key].length > 1) {
      const nextValue = this.mapper.sinkKeys['maps'][key][index].target.value;
      this.mapper.sinkKeys['maps'][key][index - 1].target.value =
        this.mapper.sinkKeys['maps'][key][index - 1].target.value + nextValue;
      this.mapper.sinkKeys['maps'][key].splice(index, 1);
    }
    setTimeout(() => {
      this.mapper.mapSinkKeys.next(this.mapper.sinkKeys);
    }, 0);
  }

  deleteFunctionMap(data: any, index: any) {
    data.splice(index, 1);
  }

  ////set

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

  printTree() {
    console.log(this.mappingFields, this.mapper.mappingConfig);
    localStorage.setItem('mapping', JSON.stringify(this.mapper.mappingConfig));
  }

  removeTag(e: any) {
    console.log(e);
  }

  changeNodeconfig(event: any) {
    console.log(event);
  }

  changeConnection(data: any) {
    this.canvasMap.changeConnection(data);
  }

  changeConnector(data: any) {
    this.canvasMap.changeConnector(data);
  }

  ///func

  changedText(content: any, node: any) {
    console.log(content);
    this.activeNode = node;

    // this.changedValue = content;
    this.txtQueryChanged.next(content);
    // this.modal.open(content, { backdrop: 'static' });
    // this.backendService.getService(Transformer.transformerTypes).subscribe((res: any) => {
    //   this.transformers = res;
    // });
  }

  changeObject(data: string) {
    this.canvasMap.changeObject(data);
  }

  addFunction(data: any) {
    // const dataFunc = _.cloneDeep(data);
    // dataFunc.input = dataFunc.input ? JSON.parse(dataFunc.input) : [];
    // dataFunc.transformerName = dataFunc.name;
    // delete dataFunc.name;
    // dataFunc.output = dataFunc.output ? JSON.parse(dataFunc.output) : [];
    // const uuid = Math.random()
    //   .toString(36)
    //   .substr(2, 9);
    // if (!this.mapper.sinkKeys.transformers) this.mapper.sinkKeys.transformers = {};
    // this.mapper.sinkKeys.transformers[uuid] = dataFunc;
    // this.closeModel();
  }

  ////save config

  saveNodeData() {
    this.canvasMap.saveNodeData();
  }
}
