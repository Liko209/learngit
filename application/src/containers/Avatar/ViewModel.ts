/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-9-17 16:24:02
 * Copyright © RingCentral. All rights reserved.
 */

import { ENTITY_NAME } from '@/store';
import { getEntity }  from '@/store/utils';
import { observable, action } from 'mobx';
import PersonModel from '../../store/models/Person';

class ViewModel {
  constructor() {}
  @observable person: PersonModel;
  @action.bound
  public async getPersonInfo (uId: number) {
    this.person = await getEntity(ENTITY_NAME.PERSON, uId) as PersonModel;
    console.log(this.person);
  }
  @action.bound
  public async handleUserName() {
    // headShot有值直接用，
    const { firstName, lastName, headshot } = await this.person;
    if (headshot) {
      return headshot;
    }
    const userName = `${firstName} ${lastName}`;
    return userName;
  }
}
export default ViewModel;
