/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:29
 * Copyright © RingCentral. All rights reserved.
 */

import { computed } from 'mobx';
import { AbstractViewModel } from '@/base';
import { ProfileDialogGroupProps, ProfileDialogGroupViewProps } from './types';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store';
import { COUNT_TO_SHOW_SEARCH } from './Content/Members/constants';
import portalManager from '@/common/PortalManager';
import { defaultNotificationOptions } from '@/common/catchError';
import { Notification } from '@/containers/Notification';
import { i18nP } from '@/utils/i18nT';

class ProfileDialogGroupViewModel
  extends AbstractViewModel<ProfileDialogGroupProps>
  implements ProfileDialogGroupViewProps {
  constructor(props: ProfileDialogGroupProps) {
    super(props);
    this.reaction(
      () => this.group,
      group => {
        if (!group.members) {
          // you have been removed from the team!
          portalManager.dismissLast();
          Notification.flashToast({
            ...defaultNotificationOptions,
            message: i18nP('people.prompt.youHaveBeenRemovedFromTeam'),
          });
        }
      },
      { fireImmediately: true },
    );
  }
  @computed
  get id() {
    return this.props.id; // conversation id
  }

  @computed
  get group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed
  get hasSearch() {
    return (
      this.group.members && this.group.members.length > COUNT_TO_SHOW_SEARCH
    );
  }
}

export { ProfileDialogGroupViewModel };
