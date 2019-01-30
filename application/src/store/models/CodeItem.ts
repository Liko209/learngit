/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-01-17 09:24:28
 * Copyright © RingCentral. All rights reserved.
 */

import { CodeItem } from 'sdk/module/item/entity';
import { observable } from 'mobx';
import ItemModel from './Item';

export default class CodeItemModel extends ItemModel {
  @observable
  body: string;

  @observable
  mode: string;

  @observable
  mimeType: string;

  @observable
  wrapLines: boolean;

  @observable
  title: string;

  constructor(data: CodeItem) {
    super(data);
    const {
      body,
      mode,
      mime_type: mimeType,
      wrap_lines: wrapLines,
      title,
    } = data;

    this.body = body;
    this.mimeType = mimeType;
    this.wrapLines = wrapLines;
    this.mode = mode;
    this.title = title || '';
  }

  static fromJS(data: CodeItem) {
    return new CodeItemModel(data);
  }
}
