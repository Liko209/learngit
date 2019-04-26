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

import { GroupConfig } from 'sdk/models';
import GroupConfigModel from '@/store/models/GroupConfig';

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
  get groupConfig() {
    return getEntity<GroupConfig, GroupConfigModel>(
      ENTITY_NAME.GROUP_CONFIG,
      this.id,
    );
  }

  @computed
  get hasDraft() {
    const { draft, attachmentItemIds: draftItemIds } = this.groupConfig;
    return !!(
      (draftItemIds && draftItemIds.length > 0) ||
      (draft && draft.length > 0)
    );
  }

  @computed
  get sendFailurePostIds() {
    return this.groupConfig.sendFailurePostIds || [];
  }
}
export { IndicatorViewModel };
