/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-06 13:45:03
 * Copyright © RingCentral. All rights reserved.
 */

import _ from 'lodash';
import { observable, computed } from 'mobx';
import { Progress } from 'sdk/models';
import Base from './Base';

export default class UploadProgressModel extends Base<Progress> {
  @observable
  total: number;

  @observable
  loaded: number;

  constructor(data: Progress) {
    super(data);
    this.total = data.total;
    this.loaded = data.loaded;
  }

  @computed
  get progress() {
    if (this.loaded < 0) {
      return 0;
    }
    if (this.loaded > this.total) {
      return 1;
    }
    return this.loaded / this.total;
  }

  static fromJS(data: Progress) {
    return new UploadProgressModel(data);
  }
}
