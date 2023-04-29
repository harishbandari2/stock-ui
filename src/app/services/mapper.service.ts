import { ElementRef, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import * as _ from 'lodash';
import { SourceComponent } from '../global-components/source/source.component';
import { SinkComponent } from '../global-components/sink/sink.component';

@Injectable()
export class MapService {
  activeIMapId: any;
  targetSockets: any = [];
  sourceMappedSockets: any = {};
  targetMappedSockets: any = {};
  IMapConfig: any = {};

  mappedIndicationReference: any = {};
  allInputNodesForDefining: any = {};
  functionData: any = {};
  inputActiveNode: any = {};
  outputActiveNode: any = {};

  mapSinkKeys: Subject<any> = new BehaviorSubject<any>({});
  sinkKeys: any = {};
  activeLineMapConnections: any = {};
  updatedSVGPaths: any = [];
  outputAreaScrollLeftPostion: number = 0;
  maps: any = {};
  public showConfig = false;
  public testData: any;

  public mappingConfig: any = { condition: {} };

  dataElementTypeCollection = [
    'integerArray',
    'stringArray',
    'numberArray',
    'objectArray',
    'booleanArray',
    'string',
    'integer',
    'number',
    'object',
    'boolean'
  ];

  objectType = ['object', 'objectArray'];
  documentType = ['document', 'documentArray'];

  constructor() {
    this.mapSinkKeys.subscribe(res => {
      let maps = _.cloneDeep(res);

      if (maps) {
        let data: any = { maps: [], transformers: [] };
        for (let item in maps.maps) {
          if (item !== 'transformers')
            maps.maps[item].forEach((el: any) => {
              if (el.functionInfo) {
                let tmap: any = { inputs: [], outputs: [], setValue: [] };
                for (let ikey in el.inputs) {
                  let inputsMaps = el.inputs[ikey] || [];
                  inputsMaps.forEach((eli: any) => {
                    tmap.inputs.push({
                      source: eli.source,
                      target: eli.target,
                      type: eli.type,
                      isConditionSet: eli.mapCondition.isConditionSet
                    });
                  });
                }
                for (let ikey in el.outputs) {
                  let outputsMaps = el.outputs[ikey] || [];
                  outputsMaps.forEach((eli: any) => {
                    tmap.outputs.push({
                      source: eli.source,
                      target: eli.target,
                      type: eli.type,
                      isConditionSet: eli.mapCondition.isConditionSet
                    });
                  });
                }
                data.transformers.push(tmap);
              } else {
                data.maps.push({
                  source: el.source,
                  target: el.target,
                  type: el.type
                });
              }
            });

          this.mappedIndicationReference = data;
          this.showMappingLineClick();
        }
      }
    });
  }

  public connect(source: SourceComponent, sink: SinkComponent) {
    let sourceType = source.node.dataElementType;
    let sourcePath = source.node.key;
    let targetType = sink.node.dataElementType;
    let targetPath = sink.node.key;

    if (targetPath && sink.node.mapper) {
      let mapType = sourcePath.includes(`[]`) || (targetPath && targetPath.includes(`[]`)) ? 'list' : 'map';
      let mapData: any = {
        source: { title: source.node.title, path: sourcePath, dataType: sourceType },
        target: { title: sink.node.title, path: targetPath, dataType: targetType },
        type: mapType
      };
      // {
      //   type: 'setValue',
      //   target: {
      //     path: targetPath,
      //     title: sink.node.title,
      //     value: ''
      //   }
      // }

      if (mapType == 'list') {
        let sourceArray = sourcePath.split('/');
        let targetArray = targetPath.split('/');
        // mapData.mapCondition.sourceTreeIndex = this.getTree(this.getFlattenArray(sourceArray));
        // mapData.mapCondition.targetTreeIndex = this.getTree(this.getFlattenArray(targetArray));
      }
      if (source.function || sink.function) {
        if (source.function) {
          let mapData: any = [
            {
              source: { title: source.node.title, path: sourcePath, dataType: sourceType },
              target: { title: sink.node.title, path: targetPath, dataType: targetType },
              type: 'transformer',
              transformerRefId: source.function
            }
          ];

          this.pushToMaps(sink, mapData);

          // if (this.sinkKeys['transformers'][source.functionIndex]['outputs'][sink.node.key]) {
          //   this.sinkKeys['transformers'][source.functionIndex]['outputs'][sink.node.key].push(mapData);
          // } else {
          //   this.sinkKeys['transformers'][source.functionIndex]['outputs'][sink.node.key] = [mapData];
          // }
        }
        if (sink.function) {
          if (this.sinkKeys['transformers'][sink.function]['inputs']) {
            this.sinkKeys['transformers'][sink.function].inputs.push(...mapData);
          } else {
            this.sinkKeys['transformers'][sink.function].inputs = mapData;
          }
        }
      } else {
        this.pushToMaps(sink, mapData);
      }

      this.mapSinkKeys.next(this.sinkKeys);
      this.showMappingLineClick();
    } else {
      console.log('nop');
    }
  }

  pushToMaps(sink: any, mapData: any) {
    const component = mapData.source.path.split('/')[0];

    if (!this.sinkKeys['maps']) this.sinkKeys.maps = {};
    if (this.sinkKeys && this.sinkKeys['maps'][sink.node.key]) {
      this.sinkKeys['maps'][sink.node.key].push(mapData);
    } else {
      this.sinkKeys['maps'][sink.node.key] = [mapData];
    }
    // console.log(sink.node);

    const title = mapData.source.title;
    const key = mapData.source.path;
    const target = mapData.target.path;

    let parentTitle = key.split('/')[0];

    const data = [{ id: this.generateId(), value: parentTitle + '.' + title, path: key, target: target }];
    console.log(sink.node);
    if (sink.node.single) {
      if (this.mappingConfig[sink.node.key]) {
        this.mappingConfig[sink.node.key] = [...this.mappingConfig[sink.node.key], ...data];
      } else this.mappingConfig[sink.node.key] = data;
    } else {
      if (this.mappingConfig[sink.node.key]) {
        this.mappingConfig[sink.node.key] = this.mappingConfig[sink.node.key] + '[[' + JSON.stringify(data) + ']]';
      } else this.mappingConfig[sink.node.key] = '[[' + JSON.stringify(data) + ']]';
    }

    // console.log(this.mappingConfig,title);
  }

  public notConnected(source: SourceComponent, sink: SinkComponent) {
    if (!sink) return false;
    if (sink.function && sink.function.functionInfo && source.function && source.function.functionInfo) return false;
    if (
      (this.dataElementTypeCollection.includes(source.node.dataElementType) &&
        this.dataElementTypeCollection.includes(sink.node.dataElementType)) ||
      (this.documentType.includes(source.node.dataElementType) &&
        [...this.documentType, ...this.objectType].includes(sink.node.dataElementType)) ||
      this.objectType.includes(source.node.dataElementType)
    ) {
    } else {
      // this.notification.create('error', 'Error', `${source.node.dataElementType.toUpperCase()} to ${sink.node.dataElementType.toUpperCase()} map not allowed !`, { nzDuration: 0 });
      return false;
    }
    // let iMapId = this.tabService.curUrl.split('/').pop();
    if (sink.function && sink.function.functionInfo) {
      let transformers = this.mappedIndicationReference.transformers[sink.functionIndex];
      let isSameMap = _.find(transformers.inputs, (el: any) => {
        return el.source.path == source.node.key && el.target.path == sink.node.key;
      });
      if (isSameMap) {
        // this.notification.create('error', 'Error', `Element path already used!`, { nzDuration: 0 });
        return false;
      }

      return true;
    } else if (source.function && source.function.functionInfo) {
      let transformers = this.mappedIndicationReference.transformers[source.functionIndex];
      let isSameMap = _.find(transformers.outputs, (el: any) => {
        return el.source.path == source.node.key && el.target.path == sink.node.key;
      });
      if (isSameMap) {
        // this.notification.create('error', 'Error', `Element path already used!`, { nzDuration: 0 });
        return false;
      }
      return true;
    } else {
      let isSameMap = _.find(this.mappedIndicationReference.maps, (el: any) => {
        return el.source.path == source.node.key && el.target.path == sink.node.key;
      });
      if (isSameMap) {
        // this.notification.create('error', 'Error', `Element path already used!`, { nzDuration: 0 });
        return false;
      }
      return true;
    }
  }

  public clearMaps() {
    this.sourceMappedSockets = [];
    this.targetMappedSockets = [];
    this.mappedIndicationReference = [];
    this.activeLineMapConnections = [];
    this.targetSockets = [];
    this.sinkKeys = { maps: {} };
    this.mapSinkKeys.next({});
  }

  public registerTarget(el: ElementRef, sink: SinkComponent) {
    // console.log(sink);

    // TODO: use el.getBoundingClientRect()
    // const {node, isSelected}= sink;
    const x1 = el.nativeElement.offsetLeft;
    const y1 = el.nativeElement.offsetTop;
    const x2 = x1 + el.nativeElement.offsetWidth;
    const y2 = y1 + el.nativeElement.offsetHeight;
    this.targetSockets.push({ x1, y1, x2, y2, sink });
  }

  public resetSelection() {
    _.map(this.targetSockets, (s: any) => (s.sink.isSelected = false));
  }

  public deregisterTarget(sink: any) {
    this.targetSockets = _.filter(this.targetSockets, (s: any) => s !== sink);
  }

  public locateTarget(e: MouseEvent) {
    const x = e.clientX + window.scrollX;
    const y = e.clientY + window.scrollY;
    const found = _.find(this.targetSockets, (s: any) => {
      let el = s.sink.socket;
      const x1 = el.nativeElement.getBoundingClientRect().x;
      const y1 = el.nativeElement.getBoundingClientRect().y;
      const x2 = x1 + el.nativeElement.offsetWidth;
      const y2 = y1 + el.nativeElement.offsetHeight;
      return x <= x2 && x >= x1 && y <= y2 && y >= y1;
    });
    return _.get(found, 'sink', false);
  }

  showMappingLineClick() {
    if (typeof this.IMapConfig.showLines === 'undefined') {
      this.IMapConfig.showLines = true;
    }

    let data: any = [];
    // if (this.IMapConfig && this.IMapConfig.showLines) {
    if (this.IMapConfig.isFunctionOpen) {
      let maps = this.mappedIndicationReference.transformers || [];
      let index = this.IMapConfig.functionIndex;
      let el = maps[this.IMapConfig.functionIndex];

      if (el) {
        // find links for source
        let inputsMaps = el.inputs || [];
        if (inputsMaps)
          inputsMaps.forEach((eli: any) => {
            let sourcePoint,
              targetPoint = null;
            // for source point
            if (eli.source) {
              if (this.sourceMappedSockets[eli.source.path]) {
                sourcePoint = this.sourceMappedSockets[eli.source.path];
              } else {
                for (let key in this.sourceMappedSockets) {
                  if (eli.source.path.includes(key + '/')) {
                    sourcePoint = this.sourceMappedSockets[key];
                  }
                }
              }
            }
            // for sink point
            if (this.targetMappedSockets[`/transformers/${index}` + eli.target.path]) {
              targetPoint = this.targetMappedSockets[`/transformers/${index}` + eli.target.path];
            } else {
              for (let key in this.targetMappedSockets) {
                if (_.includes(`/transformers/${index}` + eli.target.path, key + '/')) {
                  targetPoint = this.targetMappedSockets[key];
                }
              }
            }

            if (sourcePoint && targetPoint) {
              data.push({ source: sourcePoint, sink: targetPoint });
            }
          });

        // find links for target
        let outputsMaps = el.outputs || [];
        outputsMaps.forEach((eli: any) => {
          let sourcePoint,
            targetPoint = null;
          // for source point
          if (this.sourceMappedSockets[`/transformers/${index}` + eli.source.path]) {
            sourcePoint = this.sourceMappedSockets[`/transformers/${index}` + eli.source.path];
          } else {
            for (let key in this.sourceMappedSockets) {
              if (_.includes(`/transformers/${index}` + eli.source.path, key + '/')) {
                sourcePoint = this.sourceMappedSockets[key];
              }
            }
          }

          // for sink point
          if (this.targetMappedSockets[eli.target.path]) {
            targetPoint = this.targetMappedSockets[eli.target.path];
          } else {
            for (let key in this.targetMappedSockets) {
              if (eli.target.path.includes(key + '/')) {
                targetPoint = this.targetMappedSockets[key];
              }
            }
          }
          if (sourcePoint && targetPoint) {
            data.push({ source: sourcePoint, sink: targetPoint });
          }
        });
      }
    } else {
      let maps = this.mappedIndicationReference.maps;
      let transformers = this.mappedIndicationReference.transformers || [];
      if (maps)
        maps.forEach((el: any) => {
          let sourcePoint,
            targetPoint = null;
          if (el.source && this.sourceMappedSockets[el.source.path]) {
            // for source point
            sourcePoint = this.sourceMappedSockets[el.source.path];
          } else {
            for (let key in this.sourceMappedSockets) {
              if (el.source && el.source.path.includes(key + '/')) {
                sourcePoint = this.sourceMappedSockets[key];
              }
            }
          }
          // for sink point
          if (el.target && this.targetMappedSockets[el.target.path]) {
            targetPoint = this.targetMappedSockets[el.target.path];
          } else {
            for (let key in this.targetMappedSockets) {
              if (el.target && el.target.path.includes(key + '/')) {
                targetPoint = this.targetMappedSockets[key];
              }
            }
          }
          if (sourcePoint && targetPoint) {
            data.push({ source: sourcePoint, sink: targetPoint });
          }
        });

      transformers.forEach((el: any, index: number) => {
        let inputsMaps = el.inputs || [];
        if (inputsMaps.length > 0)
          inputsMaps.forEach((eli: any) => {
            let sourcePoint,
              targetPoint = null; // for source point
            if (eli.source) {
              if (this.sourceMappedSockets[eli.source.path]) {
                sourcePoint = this.sourceMappedSockets[eli.source.path];
              } else {
                for (let key in this.sourceMappedSockets) {
                  if (eli.source.path.includes(key + '/')) {
                    sourcePoint = this.sourceMappedSockets[key];
                  }
                }
              }
            }
            // for sink point
            if (this.targetMappedSockets[`/transformers/${index}`]) {
              targetPoint = this.targetMappedSockets[`/transformers/${index}`];
            }
            if (sourcePoint && targetPoint) {
              data.push({ source: sourcePoint, sink: targetPoint });
            }
          });

        let outputsMaps = el.outputs || [];
        outputsMaps.forEach((eli: any) => {
          let sourcePoint,
            targetPoint = null;
          // for sink point
          if (this.sourceMappedSockets[`/transformers/${index}`]) {
            sourcePoint = this.sourceMappedSockets[`/transformers/${index}`];
          }
          // for sink point
          if (this.targetMappedSockets[eli.target.path]) {
            targetPoint = this.targetMappedSockets[eli.target.path];
          } else {
            for (let key in this.targetMappedSockets) {
              if (eli.target.path.includes(key + '/')) {
                targetPoint = this.targetMappedSockets[key];
              }
            }
          }
          if (sourcePoint && targetPoint) {
            data.push({ source: sourcePoint, sink: targetPoint });
          }
        });
      });
    }

    this.activeLineMapConnections = _.uniqWith(data, _.isEqual);
    // } else {
    //   this.activeLineMapConnections = [];
    // }
    this.getUpdatedSVGPaths();
  }

  registerSourcePoint(key: any, source: any) {
    delete source.imapService;
    this.sourceMappedSockets[key] = source;
  }

  registerSinkPoint(key: any, sink: any) {
    delete sink.imapService;
    this.targetMappedSockets[key] = sink;
    // console.log(this.targetMappedSockets);
  }

  updateSourcePoint(nodeKey: string) {
    for (let key in this.sourceMappedSockets) {
      if (key.includes(nodeKey + '/')) {
        delete this.sourceMappedSockets[key];
      }
    }
  }

  updateTargetPoint(nodeKey: string) {
    for (let key in this.targetMappedSockets) {
      if (key.includes(nodeKey + '/')) {
        delete this.targetMappedSockets[key];
      }
    }
  }

  removetransformersTargetSocket(tindex: number, nodeKey: string) {
    for (let key in this.targetMappedSockets) {
      if (key.includes('/transformers/' + tindex + nodeKey + '/')) {
        delete this.targetMappedSockets[key];
      }
    }
  }

  removetransformersSourceSocket(tindex: number, nodeKey: string) {
    for (let key in this.sourceMappedSockets) {
      if (key.includes('/transformers/' + tindex + nodeKey + '/')) {
        delete this.sourceMappedSockets[key];
      }
    }
  }

  removeAlltransformersSocket() {
    for (let key in this.targetMappedSockets) {
      if (key.includes('/transformers/')) {
        delete this.targetMappedSockets[key];
      }
    }
    for (let key in this.sourceMappedSockets) {
      if (key.includes('/transformers/')) {
        delete this.sourceMappedSockets[key];
      }
    }
  }

  updatetransformersSocket(tindex: any, count: number) {
    for (let key in this.targetMappedSockets) {
      if (key.includes('/transformers/' + tindex)) {
        delete this.targetMappedSockets[key];
      }
    }
    for (let key in this.sourceMappedSockets) {
      if (key.includes('/transformers/' + tindex)) {
        delete this.sourceMappedSockets[key];
      }
    }

    for (let i = tindex + 1; i <= count; i++) {
      for (let key in this.targetMappedSockets) {
        if (key.includes('/transformers/' + i)) {
          let newKey = key.replace(`/transformers/${i}`, `/transformers/${i - 1}`);
          this.targetMappedSockets[newKey] = this.targetMappedSockets[key];
          delete this.targetMappedSockets[key];
        }
      }
    }
    for (let i = tindex + 1; i <= count; i++) {
      for (let key in this.sourceMappedSockets) {
        if (key.includes('/transformers/' + i)) {
          let newKey = key.replace(`/transformers/${i}`, `/transformers/${i - 1}`);
          this.sourceMappedSockets[newKey] = this.sourceMappedSockets[key];
          delete this.sourceMappedSockets[key];
        }
      }
    }
  }

  getFlattenArray(array: any) {
    let data = [];
    for (let i = 1; i < array.length; i++) {
      let item: any = {
        key: i,
        title: array[i],
        isArray: false,
        isLeaf: false,
        parentKey: i - 1
      };
      if (array[i].includes('[]')) {
        item.title = array[i].substring(0, array[i].length - 2);
        item.isArray = true;
        item.arrayIndex = null;
      }
      data.push(item);
    }
    return data;
  }

  // getTree(data: any) {
  //   function unflatten(array: any, parent?, tree?) {
  //     tree = typeof tree !== 'undefined' ? tree : [];
  //     parent = typeof parent !== 'undefined' ? parent : { key: 0 };

  //     let children = _.filter(array, function (child) { return child.parentKey == parent.key; });

  //     if (!_.isEmpty(children)) {
  //       if (parent.key == 0) {
  //         tree = children;
  //       } else {
  //         parent['children'] = children;
  //       }
  //       _.each(children, (child) => { unflatten(array, child) });
  //     }
  //     return tree;
  //   }

  //   return unflatten(data)
  // }

  getUpdatedSVGPaths() {
    this.updatedSVGPaths = _.map(this.activeLineMapConnections, (c: any) => {
      const { x: x1, y: y1 } = this.centrePoint(c.source);
      const { x: x2, y: y2 } = this.rightCenterPoint(c.sink);

      const pX = y1 < y2 ? x1 : x2;
      const pY = y1 < y2 ? y2 : y1;
      return {
        cX1: x1,
        cY1: y1,
        cX2: x2 + this.outputAreaScrollLeftPostion,
        cY2: y2 + 5,
        targetKey: c.sink.key,
        sourceKey: c.source.key,
        path: `${x1},${y1} ${x1 + 20},${y1} ${x2 + this.outputAreaScrollLeftPostion - 20},${y2 + 5} ${x2 +
          this.outputAreaScrollLeftPostion},${y2 + 5}`
      };
    });
  }

  centrePoint(data: any) {
    const x = data.socket.nativeElement.getBoundingClientRect().x + data.socket.nativeElement.offsetWidth;
    const y = data.socket.nativeElement.getBoundingClientRect().y + data.socket.nativeElement.offsetHeight / 2;
    return { x, y };
  }

  rightCenterPoint(data: any) {
    const x = data.socket.nativeElement.getBoundingClientRect().x + data.socket.nativeElement.offsetWidth;
    const y = data.socket.nativeElement.getBoundingClientRect().y - 12 + data.socket.nativeElement.offsetHeight;
    return { x, y };
  }

  generateId() {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}
