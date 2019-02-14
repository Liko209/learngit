/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:40:26
 * Copyright © RingCentral. All rights reserved.
 */
import { Item } from 'sdk/module/item/entity';
import { observable } from 'mobx';
import Base from './Base';

export default class ItemModel extends Base<Item> {
  @observable
  typeId: number;

  @observable
  atMentionPostIds?: number[];

  constructor(data: Item) {
    super(data);
    const { type_id } = data;
    this.typeId = type_id;
    this.atMentionPostIds = data.at_mentioning_post_ids;
  }

  static fromJS(data: Item) {
    return new ItemModel(data);
  }
}
