/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-03-06 14:40:39
 * Copyright © RingCentral. All rights reserved.
 */
import { AbstractViewModel } from '@/base';
import { ViewerTitleViewModelProps } from './types';
import _ from 'lodash';
import { computed } from 'mobx';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';

class ViewerTitleViewModel extends AbstractViewModel<
  ViewerTitleViewModelProps
> {
  @computed
  get item() {
    return getEntity(ENTITY_NAME.ITEM, this.props.currentItemId);
  }

  @computed
  get person() {
    const { newestCreatorId } = this.item;
    return newestCreatorId
      ? getEntity(ENTITY_NAME.PERSON, newestCreatorId)
      : {};
  }
}

export { ViewerTitleViewModel };
