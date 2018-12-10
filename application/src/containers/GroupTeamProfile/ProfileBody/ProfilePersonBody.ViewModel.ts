/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';
import { ProfileBodyProps } from './types';
import { ProfileGroupBodyViewModel } from './ProfileGroupBody.ViewModel';

class ProfilePersonBodyViewModel extends ProfileGroupBodyViewModel{
  constructor(props: ProfileBodyProps) {
    super(props);
  }
  @computed
  get awayStatus() {
    return this._profileData.awayStatus;
  }
  @computed
  get jobTitle() {
    return this._profileData.jobTitle;
  }
  @computed
  get isCurrentUser() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID) === this.id;
  }
  @computed
  get isPerson() {
    return this._type === TypeDictionary.TYPE_ID_PERSON;
  }
  @computed
  get isGroup() {
    return this._type === TypeDictionary.TYPE_ID_GROUP;
  }
}
export { ProfilePersonBodyViewModel };
