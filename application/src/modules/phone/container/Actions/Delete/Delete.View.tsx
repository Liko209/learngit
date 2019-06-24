/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:28:07
 * Copyright © RingCentral. All rights reserved.
 */
import { withTranslation, WithTranslation, Trans } from 'react-i18next';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiActionIconWrapper } from 'jui/pattern/Phone/VoicemailItem';
import { Dialog } from '@/containers/Dialog';
import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { DeleteViewProps, BUTTON_TYPE } from './types';
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
          <Trans
            i18nKey="voicemail.areYouSureYouWantToDeleteTheVoicemail"
          />
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
          <Trans
            i18nKey="calllog.doYouWanttoDeleteThisCallLog"
          />
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
        return t('phone.delete');
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
    if (type === BUTTON_TYPE.ICON) {
      return (
        <JuiActionIconWrapper>
          <JuiIconButton
            color="common.white"
            variant="round"
            autoFocus={false}
            size="small"
            key={`${entity}-delete`}
            data-test-automation-id={`${entity}-delete-button`}
            ariaLabel={this._screenReader}
            tooltipTitle={this._tooltip}
            onClick={this._handleClick}
          >
            delete
          </JuiIconButton>
        </JuiActionIconWrapper>
      );
    }
    return (
      <JuiMenuItem
        icon="delete"
        key={`${entity}-delete`}
        onClick={this._handleClick}
        aria-label={this._screenReader}
        data-test-automation-id={`${entity}-delete-button`}
      >
        {this._screenReader}
      </JuiMenuItem>
    );
  }
}

const DeleteView = withTranslation('translations')(DeleteViewComponent);

export { DeleteView };
