/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:02:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProfileButtonProps } from './types';

class ProfileViewModel extends AbstractViewModel<ProfileButtonProps> {
  @computed
  get id() {
    return this.props.id;
  }
}

export { ProfileViewModel };
