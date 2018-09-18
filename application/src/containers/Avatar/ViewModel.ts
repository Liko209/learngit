/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-17 16:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ENTITY_NAME } from '@/store';
import { getEntity }  from '@/store/utils';
import { computed, observable, action } from 'mobx';

class ViewModel {
  constructor() {}
  @observable person = {};
  @action
  public getPersonInfo (uId: number) {
    this.person = getEntity(ENTITY_NAME.PERSON, 1564675);
    console.log('this.person');
    console.log(this.person);
  }
  public
  @computed
  get handleUserName() {
    const english = /^[A-Za-z0-9]*$/;
    const { firstName, lastname } = this.person;
  }
}
export default ViewModel;
