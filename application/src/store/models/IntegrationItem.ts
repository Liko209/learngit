/*
 * @Author: Lip Wang (lip.wang@ringcentral.com)
 * @Date: 2019-04-29 10:14:28
 * Copyright © RingCentral. All rights reserved.
 */
import ItemModel from './Item';
import { IntegrationItem } from 'sdk/module/item/entity';
import { observable } from 'mobx';
export default class IntegrationItemModel extends ItemModel {
  @observable activity: string;
  @observable title: string;
  @observable body: string;
  constructor(data: IntegrationItem) {
    super(data);
    const { activity, title, body } = data;
    this.activity = activity;
    this.title = title || '';
    this.body = body;
  }

  get text() {
    // this is just a simple example
    // add business logic here
    return this.title + this.body;
  }
  static fromJS(data: IntegrationItem) {
    return new IntegrationItemModel(data);
  }
}
