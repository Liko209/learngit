/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import {
  ProfileMiniCardGroupProps,
  ProfileMiniCardGroupViewProps,
} from './types';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import storeManager, { ENTITY_NAME } from '@/store';
import { GlipTypeUtil } from 'sdk/utils';
import { Notification } from '@/containers/Notification';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { ERROR_CODES_NETWORK, JServerError, errorHelper } from 'sdk/error';
import { generalErrorHandler } from '@/utils/error';

class ProfileMiniCardGroupViewModel
  extends AbstractViewModel<ProfileMiniCardGroupProps>
  implements ProfileMiniCardGroupViewProps {
  @computed
  get id() {
    return this.props.id; // conversation id
  }

  @computed
  get group() {
    const onError = (error: Error) => {
      if (errorHelper.isBackEndError(error)) {
        Notification.flashToast({
          message: 'SorryWeWereNotAbleToOpenThisProfile',
          type: 'error',
          messageAlign: 'left',
          fullWidth: false,
          dismissible: false,
        });
      } else {
        generalErrorHandler(error);
      }
    };
    const entity = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
    const groupStore = storeManager.getEntityMapStore(
      ENTITY_NAME.GROUP,
    ) as MultiEntityMapStore<Group, GroupModel>;
    if (!entity.members) {
      groupStore
        .getByService(this.id)
        .then((group: Group | null) => {
          if (group) {
            groupStore.set(group);
          } else {
            onError(new JServerError(ERROR_CODES_NETWORK.GENERAL, ''));
          }
        })
        .catch(onError);
    }
    return entity;
  }

  @computed
  get typeId(): number {
    return GlipTypeUtil.extractTypeId(this.id);
  }
}

export { ProfileMiniCardGroupViewModel };
