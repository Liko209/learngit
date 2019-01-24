/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-16 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import { t } from 'i18next';
import { goToConversation } from '@/common/goToConversation';
import { Dialog } from '@/containers/Dialog';
import { errorHelper } from 'sdk/error';
import { GroupService as NGroupService } from 'sdk/module/group';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { Notification } from '@/containers/Notification';
import GroupModel from '@/store/models/Group';
import { SortableModel } from 'sdk/framework/model';
import { Group } from 'sdk/module/group/entity';

const joinHander = async (conversationId: number) => {
  const nGroupService = new NGroupService();
  const useId = await getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  try {
    await nGroupService.joinTeam(useId, conversationId);
  } catch (error) {
    const e = error;
    if (errorHelper.isNotAuthorizedError(e)) {
      Notification.flashToast({
        message: 'JoinTeamNotAuthorizedError',
        type: 'error',
        messageAlign: 'left',
        fullWidth: false,
        dismissible: false,
      });
    }
    throw error;
  }
};

const joinTeam = (item: GroupModel | SortableModel<Group>) => (
  e?: React.MouseEvent<HTMLElement>,
) => {
  e && e.stopPropagation();
  Dialog.confirm({
    title: t('joinTeamTitle'),
    content: t('joinTeamContent', { teamName: item.displayName }),
    okText: t('join'),
    cancelText: t('Cancel'),
    onOK: () =>
      goToConversation({
        id: item.id,
        async beforeJump(conversationId: number) {
          await joinHander(conversationId);
        },
      }),
  });
};

export { joinTeam, joinHander };
