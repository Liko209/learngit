/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2018-12-26 15:26:19
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import { Progress } from 'sdk/models';
import Base from './Base';
import { PROGRESS_STATUS } from 'sdk/module';

class ProgressModel extends Base<Progress> {
  @observable
  rate?: { total: number; loaded: number };
  @observable
  status?: PROGRESS_STATUS;

  constructor(data: Progress) {
    console.log('​ProgressModel -> constructor -> data', data);
    super(data);
    const { rate, status } = data;
    this.rate = rate;
    this.status = status;
  }

  get progressStatus() {
    if (this.id < 0) {
      return this.status !== undefined ? this.status : PROGRESS_STATUS.FAIL;
    }
    return PROGRESS_STATUS.SUCCESS;
  }

  get progressRate() {
    return this.rate;
  }

  static fromJS(data: Progress) {
    return new ProgressModel(data);
  }
}

export { ProgressModel as default };
