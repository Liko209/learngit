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

type Props = DeleteViewProps & WithTranslation;

@observer
class DeleteViewComponent extends Component<Props> {
  _handleClick = () => {
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
        const result = await this.props.delete();
        dialog.stopLoading();
        if (!result) {
          return false;
        }
        return true;
      },
    });
  }

  render() {
    const { t, type } = this.props;
    if (type === BUTTON_TYPE.ICON) {
      return (
        <JuiActionIconWrapper>
          <JuiIconButton
            color="common.white"
            variant="round"
            autoFocus={false}
            size="small"
            key="voicemail-delete"
            data-test-automation-id="voicemail-delete-button"
            ariaLabel={t('voicemail.deleteVoicemail')}
            tooltipTitle={t('voicemail.delete')}
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
        onClick={this._handleClick}
        aria-label={t('voicemail.deleteVoicemail')}
        data-test-automation-id="voicemail-delete-button"
      >
        {t('voicemail.deleteVoicemail')}
      </JuiMenuItem>
    );
  }
}

const DeleteView = withTranslation('translations')(DeleteViewComponent);

export { DeleteView };
