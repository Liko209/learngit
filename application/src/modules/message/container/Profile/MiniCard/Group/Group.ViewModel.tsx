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
import { GroupService } from 'sdk/module/group';
import storeManager, { ENTITY_NAME } from '@/store';
import { GlipTypeUtil } from 'sdk/utils';
import { Notification } from '@/containers/Notification';
import MultiEntityMapStore from '@/store/base/MultiEntityMapStore';
import { errorHelper } from 'sdk/error';
import { generalErrorHandler } from '@/utils/error';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

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
          message: 'people.prompt.SorryWeWereNotAbleToOpenThisProfile',
          type: ToastType.ERROR,
          messageAlign: ToastMessageAlign.LEFT,
          fullWidth: false,
          dismissible: false,
        });
      } else {
        generalErrorHandler(error);
      }
    };
    const groupStore = storeManager.getEntityMapStore(
      ENTITY_NAME.GROUP,
    ) as MultiEntityMapStore<Group, GroupModel>;
    if (!groupStore.hasValid(this.id)) {
      const groupService = ServiceLoader.getInstance<GroupService>(
        ServiceConfig.GROUP_SERVICE,
      );
      const group = groupService.getSynchronously(this.id);
      if (group) {
        groupStore.set(group);
      } else {
        groupService
        .getById(this.id)
        .then((group: Group | null) => {
          if (group) {
            groupStore.set(group);
          }
        })
        .catch(onError);
      }
      
    }
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get typeId(): number {
    return GlipTypeUtil.extractTypeId(this.id);
  }
}

export { ProfileMiniCardGroupViewModel };
