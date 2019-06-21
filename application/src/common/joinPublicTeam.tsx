/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-16 09:12:51
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import i18nT from '@/utils/i18nT';
import { Trans } from 'react-i18next';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { Dialog } from '@/containers/Dialog';
import { GroupService } from 'sdk/module/group';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { handleError, NOTIFICATION_TYPE } from '@/common/catchError';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

const joinHander = async (conversationId: number) => {
  try {
    const nGroupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const useId = await getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    await nGroupService.joinTeam(useId, conversationId);
  } catch (error) {
    handleError(NOTIFICATION_TYPE.FLASH, error, null, {
      network: 'people.prompt.JoinTeamErrorForNetworkIssue',
      server: 'people.prompt.JoinTeamErrorForServerIssue',
      authentication: 'people.prompt.JoinTeamErrorForAuthIssue',
    });
    throw error;
  }
};

const joinPublicTeam = async (item: GroupModel) => {
  Dialog.confirm({
    modalProps: { 'data-test-automation-id': 'join-team-dialog' },
    title: await i18nT('people.team.joinTeamTitle'),
    content: (
      <JuiDialogContentText>
        <Trans
          i18nKey="people.team.joinTeamContent"
          values={{ teamName: item.displayName }}
          components={[<strong key="0" />]}
        />
      </JuiDialogContentText>
    ),
    okText: await i18nT('people.team.joinTeamSubmit'),
    cancelText: await i18nT('common.dialog.cancel'),
    onOK: () =>
      goToConversationWithLoading({
        id: item.id,
        async beforeJump(conversationId: number) {
          await joinHander(conversationId);
        },
      }),
  });
};

export { joinPublicTeam, joinHander };
