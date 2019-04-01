/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-16 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import i18next from 'i18next';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { Dialog } from '@/containers/Dialog';
import { errorHelper } from 'sdk/error';
import { GroupService } from 'sdk/module/group';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import { Notification } from '@/containers/Notification';
import GroupModel from '@/store/models/Group';
import {
  ToastMessageAlign,
  ToastType,
} from '@/containers/ToastWrapper/Toast/types';

const joinHander = async (conversationId: number) => {
  const nGroupService: GroupService = GroupService.getInstance();
  const useId = await getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  try {
    await nGroupService.joinTeam(useId, conversationId);
  } catch (error) {
    const e = error;
    if (errorHelper.isAuthenticationError(e)) {
      Notification.flashToast({
        message: 'people.prompt.JoinTeamNotAuthorizedError',
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    }
    throw error;
  }
};

const joinTeam = (item: GroupModel) => (e?: React.MouseEvent<HTMLElement>) => {
  e && e.stopPropagation();
  Dialog.confirm({
    title: i18next.t('people.team.joinTeamTitle'),
    content: i18next.t('people.team.joinTeamContent', {
      teamName: item.displayName,
    }),
    okText: i18next.t('people.team.joinTeamSubmit'),
    cancelText: i18next.t('common.dialog.cancel'),
    onOK: () =>
      goToConversationWithLoading({
        id: item.id,
        async beforeJump(conversationId: number) {
          await joinHander(conversationId);
        },
      }),
  });
};

export { joinTeam, joinHander };
