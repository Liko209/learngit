/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-12-17 15:28:38
 * Copyright © RingCentral. All rights reserved.
 */
import { NoteItem } from 'sdk/models';
import { observable } from 'mobx';
import ItemModel from './Item';

export default class NoteItemModal extends ItemModel {
  @observable title: string;
  @observable summary: string;

  constructor(data: NoteItem) {
    super(data);
    const { title, summary } = data;
    this.title = title;
    this.summary = summary;
  }

  static fromJS(data: NoteItem) {
    return new NoteItemModal(data);
  }
}
