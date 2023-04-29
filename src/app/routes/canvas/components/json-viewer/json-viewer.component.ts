import { Component, OnInit, Input, ChangeDetectionStrategy } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from '@angular/common';

@Component({
  selector: 'app-json-viewer',
  templateUrl: './json-viewer.component.html',
  styleUrls: ['./json-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JsonViewerComponent implements OnInit {
  @Input() data: any;
  constructor() {}

  ngOnInit() {}
  clicked(e: any) {
    e.stopPropagation();
    const thisClassList = e.target.classList;
    if (thisClassList.contains('expanded')) {
      thisClassList.replace('expanded', 'collapsed');
    } else {
      thisClassList.replace('collapsed', 'expanded');
    }
    const targetEl = e.target.tagName === 'I' ? e.target.parentNode.parentNode : e.target.parentNode;
    const children =
      targetEl.querySelector('ul') ||
      (targetEl.nextSibling && targetEl.nextSibling.querySelector && targetEl.nextSibling.querySelector('ul'));
    if (children && children.classList) {
      const classList = children.classList;
      if (classList.contains('open')) {
        classList.remove('open');
      } else {
        classList.add('open');
      }
    }
  }
  isEmptyObject(obj: any) {
    return obj && Object.keys(obj).length === 0;
  }
  originalOrder = (a: KeyValue<number, string>, b: KeyValue<number, string>): number => {
    return 0;
  };
}

@Pipe({ name: 'type' })
export class Type implements PipeTransform {
  transform(value: any) {
    if (value instanceof Date) return 'date';
    if (value === null) return 'null';
    return Array.isArray(value) ? 'array' : typeof value;
  }
}
