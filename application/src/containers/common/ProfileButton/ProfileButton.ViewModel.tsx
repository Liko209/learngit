/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-26 17:02:02
 * Copyright © RingCentral. All rights reserved.
 */
import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProfileButtonProps } from './types';
import { GlipTypeUtil } from 'sdk/utils';

class ProfileButtonViewModel extends AbstractViewModel<ProfileButtonProps> {
  @computed
  get id() {
    return this.props.id;
  }

  @computed
  get typeId(): number {
    return GlipTypeUtil.extractTypeId(this.id);
  }
}

export { ProfileButtonViewModel };
