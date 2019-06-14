/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-05-29 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { Trans } from 'react-i18next';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { Group, GroupService } from 'sdk/module/group';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { i18nP } from '@/utils/i18nT';
import { toTitleCase } from '@/utils/string';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import { getEntity } from '@/store/utils';
import portalManager from '@/common/PortalManager';
import { catchError } from '@/common/catchError';
import { Dialog } from '@/containers/Dialog';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';

const notifyActionSuccess = (message: string) => {
  Notification.flashToast({
    message,
    type: ToastType.SUCCESS,
    messageAlign: ToastMessageAlign.LEFT,
    fullWidth: false,
    dismissible: false,
  });
};

const confirmActionAlert = async (promise: Promise<boolean>, dialog: any) => {
  dialog.startLoading();

  const result = await promise;

  dialog.stopLoading();

  if (result) {
    dialog.dismiss();

    portalManager.dismissLast();
  }

  return Boolean(result);
};

class TeamActionHandler {
  get service() {
    return ServiceLoader.getInstance<GroupService>(ServiceConfig.GROUP_SERVICE);
  }

  getTeamEntity(teamId: number) {
    const { isTeam, displayName } = getEntity<Group, GroupModel>(
      ENTITY_NAME.GROUP,
      teamId,
    );

    return { isTeam, displayName };
  }

  onTeamDelete = async (teamId: number) => {
    const { isTeam, displayName } = this.getTeamEntity(teamId);

    if (!isTeam) return;

    const title = i18nP('people.team.deleteTeamConfirmTitle');
    const okText = i18nP('people.team.deleteTeamConfirmOk');
    const cancelText = i18nP('common.dialog.cancel');

    const content = (
      <JuiDialogContentText>
        <Trans
          i18nKey="people.team.deleteTeamConfirmContent"
          values={{ teamName: displayName }}
          components={[<strong key="0" />]}
        />
      </JuiDialogContentText>
    );

    const dialog = Dialog.confirm({
      title,
      content,
      modalProps: { 'data-test-automation-id': 'deleteTeamConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'deleteTeamOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'deleteTeamCancelButton' },
      size: 'small',
      okType: 'negative',
      okText: toTitleCase(okText),
      cancelText: toTitleCase(cancelText),
      onOK: async () => await this._onTeamDeleteConfirm(teamId, dialog),
    });
  }

  private _onTeamDeleteConfirm = async (teamId: number, dialog: any) => {
    const result = this.handleTeamDelete(teamId);

    return await confirmActionAlert(result, dialog);
  }

  @catchError.flash({
    network: 'people.prompt.deleteTeamNetworkErrorContent',
    server: 'people.prompt.deleteTeamServerErrorContent',
  })
  handleTeamDelete = async (teamId: number) => {
    await this.service.deleteTeam(teamId);

    notifyActionSuccess('people.team.deleteTeamSuccessMsg');

    return true;
  }

  onTeamArchive = async (teamId: number) => {
    const { isTeam, displayName } = this.getTeamEntity(teamId);

    if (!isTeam) return;

    const title = i18nP('people.team.archiveTeamConfirmTitle');
    const okText = i18nP('people.team.archiveTeamConfirmOk');
    const cancelText = i18nP('cancel');

    const content = i18nP('people.team.archiveTeamConfirmContent', {
      teamName: displayName,
    });

    const dialog = Dialog.confirm({
      title,
      content,
      modalProps: { 'data-test-automation-id': 'archiveTeamConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'archiveTeamOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'archiveTeamCancelButton' },
      size: 'small',
      okType: 'primary',
      okText: toTitleCase(okText),
      cancelText: toTitleCase(cancelText),
      onOK: async () => await this._onTeamArchiveConfirm(teamId, dialog),
    });
  }

  private _onTeamArchiveConfirm = async (teamId: number, dialog: any) => {
    const result = this.handleTeamArchive(teamId);

    return await confirmActionAlert(result, dialog);
  }

  @catchError.flash({
    network: 'people.prompt.archiveTeamNetworkErrorContent',
    server: 'people.prompt.archiveTeamServerErrorContent',
  })
  handleTeamArchive = async (teamId: number) => {
    await this.service.archiveTeam(teamId);

    notifyActionSuccess('people.team.archiveTeamSuccessMsg');

    return true;
  }
}

const teamActionHandler = new TeamActionHandler();

export { teamActionHandler };
