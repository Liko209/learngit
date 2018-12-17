/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:40:26
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/models';
import { observable } from 'mobx';
import Base from './Base';

export default class ItemModel extends Base<Item> {
  @observable
  typeId: number;
  // @observable
  // doNotRender: boolean;
  // @observable
  // deactivated: boolean;
  // @observable
  // summary: string;
  // @observable
  // title: string;
  // @observable
  // url: string;
  // @observable
  // image: string;
  constructor(data: Item) {
    super(data);
    const { type_id } = data;
    this.typeId = type_id;
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
