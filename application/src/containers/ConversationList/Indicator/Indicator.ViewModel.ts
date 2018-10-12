/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { observable, computed, action } from 'mobx';
import { AbstractViewModel } from '@/base';
import { IndicatorProps, IndicatorViewProps } from './types';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';

class IndicatorViewModel extends AbstractViewModel
  implements IndicatorViewProps {
  @observable id: number; // group id

  @action
  onReceiveProps({ id }: IndicatorProps) {
    if (id !== this.id) {
      this.id = id;
    }
  }

  @computed
  get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get draft() {
    return this._group.draft;
  }

  @computed
  get sendFailurePostIds() {
    return this._group.sendFailurePostIds || [];
  }
}
export { IndicatorViewModel };
