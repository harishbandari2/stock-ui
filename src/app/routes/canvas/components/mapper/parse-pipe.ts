import { Component, Input, OnInit, Pipe, ViewChild, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as _ from 'lodash';

@Pipe({
  name: 'sanitizedHtml'
})
export class SanitizedHtmlPipe implements PipeTransform {
  constructor(private sanitized: DomSanitizer) {}
  transform(value: string): any {
    // console.log(value);

    let stringArray = _.cloneDeep(value.split('%%'));

    const newData = this.mapToHtml(stringArray);
    console.log(newData);

    return this.sanitized.bypassSecurityTrustHtml(newData);
  }

  mapToHtml(data: any) {
    console.log(data);
    let htmltext: any = '';
    data.forEach((el: any) => {
      try {
        const obj = JSON.parse(el);

        if (obj) {
          htmltext =
            htmltext +
            `<input type = "button" disabled class="tag" value =${obj.value} 
          style="background-image: url('assets/images/logo/${obj.component}.svg')">`;
        }
      } catch (e) {
        if (el) htmltext = htmltext + el;
      }
    });
    console.log(htmltext);

    return htmltext;
  }
}
