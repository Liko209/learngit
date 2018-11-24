/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-23 11:07:02
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { computed } from 'mobx';

import { ProfileHeaderProps } from './types';

class ProfileHeaderViewModel extends StoreViewModel<ProfileHeaderProps> {
  @computed
  get groupId() {
    return this.props.id;
  }
  destroy() {
    return this.props.destroy;
  }
  @computed
  get text() {
    return this.props.text;
  }
}
export { ProfileHeaderViewModel };
