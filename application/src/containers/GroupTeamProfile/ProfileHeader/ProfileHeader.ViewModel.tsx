/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';

import { ProfileHeaderProps } from './types';
import TypeDictionary from 'sdk/utils/glip-type-dictionary/types';

class ProfileHeaderViewModel extends StoreViewModel<ProfileHeaderProps> {
  @computed
  get id() {
    return this.props.id;
  }
  @computed
  get title() {
    return this.props.title;
  }
  @computed
  get isTeam() {
    return this.props.type === TypeDictionary.TYPE_ID_TEAM;
  }
}
export { ProfileHeaderViewModel };
