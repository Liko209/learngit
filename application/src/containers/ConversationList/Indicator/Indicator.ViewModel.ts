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
import { ItemService } from 'sdk/service';

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
    const itemService: ItemService = ItemService.getInstance();
    const result = itemService.getUploadItems(this.id);
    return this._group.draft || result.length > 0;
  }

  @computed
  get sendFailurePostIds() {
    return this._group.sendFailurePostIds || [];
  }
}
export { IndicatorViewModel };
