/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 10:14:28
 * Copyright © RingCentral. All rights reserved.
 */
import ItemModel from './Item';
import {
  InteractiveMessageItem,
  InteractiveMessageItemAttachment,
} from 'sdk/module/item/entity';
import { observable } from 'mobx';
export default class InteractiveMessageItemModel extends ItemModel {
  @observable title: string;
  @observable attachments?: InteractiveMessageItemAttachment[];
  constructor(data: InteractiveMessageItem) {
    super(data);
    const { title, attachments } = data;
    this.title = title || '';
    this.attachments = attachments;
  }

  get text() {
    // this is just a simple example
    // add business logic here
    let text = this.title;
    if (this.attachments) {
      this.attachments.forEach(item => {
        text = text + item.pretext;
      });
    }
    return text;
  }
  static fromJS(data: InteractiveMessageItem) {
    return new InteractiveMessageItemModel(data);
  }
}
