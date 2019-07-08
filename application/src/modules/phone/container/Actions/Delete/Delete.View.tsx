/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:28:07
 * Copyright © RingCentral. All rights reserved.
 */
import { withTranslation, WithTranslation } from 'react-i18next';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { ActionButton } from 'jui/pattern/Phone/VoicemailItem';
import { Dialog } from '@/containers/Dialog';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { analyticsCollector } from '@/AnalyticsCollector';
import { PHONE_ITEM_ACTIONS } from '@/AnalyticsCollector/constants';
import { DeleteViewProps } from './types';
import { ENTITY_TYPE } from '../../constants';

type Props = DeleteViewProps & WithTranslation;

@observer
class DeleteViewComponent extends Component<Props> {
  _handleClick = () => {
    const { entity, t, tabName, deleteVoicemail, deleteCallLog } = this.props;
    const name =
      entity === ENTITY_TYPE.VOICEMAIL
        ? 'deleteVoicemail'
        : 'deleteCallLog';
    const title =
      entity === ENTITY_TYPE.VOICEMAIL
        ? t('voicemail.deleteVoicemail')
        : t('calllog.deleteCallLog');
    const content =
      entity === ENTITY_TYPE.VOICEMAIL
        ? t('voicemail.areYouSureYouWantToDeleteTheVoicemail')
        : t('calllog.doYouWanttoDeleteThisCallLog');
    const deleteItem =
      entity === ENTITY_TYPE.VOICEMAIL
        ? deleteVoicemail
        : deleteCallLog;

    analyticsCollector.phoneActions(tabName, PHONE_ITEM_ACTIONS.DELETE);

    const dialog = Dialog.confirm({
      title,
      modalProps: { 'data-test-automation-id': `${name}ConfirmDialog` },
      okBtnProps: { 'data-test-automation-id': `${name}OkButton` },
      cancelBtnProps: { 'data-test-automation-id': `${name}CancelButton` },
      size: 'small',
      content: (
        <JuiDialogContentText>
          {content}
        </JuiDialogContentText>
      ),
      okText: t('common.dialog.delete'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      onOK: async () => {
        dialog.startLoading();
        const result = await deleteItem();
        dialog.stopLoading();
        if (!result) {
          return false;
        }
        return true;
      },
    });
  }

  get _screenReader() {
    const { entity, t } = this.props;

    switch (entity) {
      case ENTITY_TYPE.VOICEMAIL:
        return t('voicemail.deleteVoicemail');
      case ENTITY_TYPE.CALL_LOG:
        return t('calllog.deleteCallLog');
      default:
        return '';
    }
  }

  render() {
    const { type, entity, t } = this.props;
    return (
      <ActionButton
        key={`${entity}-delete`}
        icon="delete-call"
        type={type}
        tooltip={t('common.delete')}
        onClick={this._handleClick}
        screenReader={this._screenReader}
        automationId={`${entity}-delete-button`}
      />
    );
  }
}

const DeleteView = withTranslation('translations')(DeleteViewComponent);

export { DeleteView };
