/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-16 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import i18next from 'i18next';
import { Trans } from 'react-i18next';
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
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';

import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const joinHander = async (conversationId: number) => {
  const nGroupService = ServiceLoader.getInstance<GroupService>(
    ServiceConfig.GROUP_SERVICE,
  );
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
    content: (
      <JuiDialogContentText>
        <Trans
          i18nKey="people.team.joinTeamContent"
          values={{ teamName: item.displayName }}
          components={[<strong key="0" />]}
        />
      </JuiDialogContentText>
    ),
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
