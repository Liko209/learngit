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
import { DeleteViewProps } from './types';
import { ENTITY_TYPE } from '../../constants';

type Props = DeleteViewProps & WithTranslation;

@observer
class DeleteViewComponent extends Component<Props> {
  _handleClick = () => {
    const { entity } = this.props;

    switch (entity) {
      case ENTITY_TYPE.VOICEMAIL:
        return this._deleteVoicemail();
      case ENTITY_TYPE.CALL_LOG:
        return this._deleteCallLog();
      default:
        return;
    }
  }

  _deleteVoicemail = () => {
    const { t } = this.props;
    const dialog = Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'deleteVoicemailConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'deleteVoicemailOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'deleteVoicemailCancelButton' },
      title: t('voicemail.deleteVoicemail'),
      content: (
        <JuiDialogContentText>
          {t('voicemail.areYouSureYouWantToDeleteTheVoicemail')}
        </JuiDialogContentText>
      ),
      okText: t('common.dialog.delete'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      onOK: async () => {
        dialog.startLoading();
        const result = await this.props.deleteVoicemail();
        dialog.stopLoading();
        if (!result) {
          return false;
        }
        return true;
      },
    });
  }

  _deleteCallLog = () => {
    const { t } = this.props;
    const dialog = Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'deleteCallLogConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'deleteCallLogOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'deleteCallLogCancelButton' },
      title: t('calllog.deleteCallLog'),
      content: (
        <JuiDialogContentText>
          {t('calllog.doYouWanttoDeleteThisCallLog')}
        </JuiDialogContentText>
      ),
      okText: t('common.dialog.delete'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      onOK: async () => {
        dialog.startLoading();
        const result = await this.props.deleteCallLog();
        dialog.stopLoading();
        if (!result) {
          return false;
        }
        return true;
      },
    });
  }

  get _tooltip() {
    const { entity, t } = this.props;

    switch (entity) {
      case ENTITY_TYPE.VOICEMAIL:
        return t('common.delete');
      case ENTITY_TYPE.CALL_LOG:
        return t('calllog.deleteCallLog');
      default:
        return '';
    }
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
    const { type, entity } = this.props;
    return (
      <ActionButton
        key={`${entity}-delete`}
        icon="delete"
        type={type}
        tooltip={this._tooltip}
        onClick={this._handleClick}
        screenReader={this._screenReader}
        automationId={`${entity}-delete-button`}
      />
    );
  }
}

const DeleteView = withTranslation('translations')(DeleteViewComponent);

export { DeleteView };
