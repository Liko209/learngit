/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-21 15:09:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';
import { GroupTeamProps } from './types';
import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
import { TypeDictionary } from 'sdk/utils';

class GroupTeamProfileViewModel extends StoreViewModel<GroupTeamProps> {
  @computed
  get id() {
    return this.props.id;
  }
  @computed
  get type() {
    return GlipTypeUtil.extractTypeId(this.id);
  }
  @computed
  get isGroupOrTeam() {
    return (this.type === TypeDictionary.TYPE_ID_TEAM) || (this.type === TypeDictionary.TYPE_ID_GROUP);
  }
}
export { GroupTeamProfileViewModel };
