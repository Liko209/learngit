/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:28:38
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/module/item/entity';
import { observable } from 'mobx';
import ItemModel from './Item';

export default class NoteItemModel extends ItemModel {
  @observable title: string;
  @observable summary: string;
  @observable creatorId: number;
  @observable deactivated: boolean;

  constructor(data: Item) {
    super(data);
    const { title, summary, creator_id, deactivated } = data;
    this.title = title!;
    this.summary = summary!;
    this.creatorId = creator_id;
    this.deactivated = deactivated;
  }

  static fromJS(data: Item) {
    return new NoteItemModel(data);
  }
}
