/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-12-05 18:29:47
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { computed } from 'mobx';
import { UserPermission } from 'sdk/module/permission/entity';
import UserPermissionModel from '@/store/models/UserPermission';
import { ENTITY_NAME } from '@/store';
import { getSingleEntity } from '@/store/utils';

class NewActionsViewModel extends StoreViewModel<Props> implements ViewProps {
  @computed
  get canCreateTeam() {
    return getSingleEntity<UserPermission, UserPermissionModel>(
      ENTITY_NAME.USER_PERMISSION,
      'canCreateTeam',
    );
  }

  @computed
  get canSendNewMessage() {
    return getSingleEntity<UserPermission, UserPermissionModel>(
      ENTITY_NAME.USER_PERMISSION,
      'canSendNewMessage',
    );
  }
}

export { NewActionsViewModel };
