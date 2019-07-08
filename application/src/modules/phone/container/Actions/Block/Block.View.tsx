/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-06-24 13:13:44
 * Copyright © RingCentral. All rights reserved.
 */

import { JuiDialogContentText } from 'jui/components/Dialog/DialogContentText';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ActionButton } from 'jui/pattern/Phone/VoicemailItem';
import { Notification } from '@/containers/Notification';
import { Dialog } from '@/containers/Dialog';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { analyticsCollector } from '@/AnalyticsCollector';
import { PHONE_ITEM_ACTIONS } from '@/AnalyticsCollector/constants';
import { SOURCE } from '../../constants';
import { BlockViewProps } from './types';

type Props = BlockViewProps & WithTranslation;

@observer
class BlockViewComponent extends Component<Props> {
  notifyActionSuccess = (message: string) => {
    Notification.flashToast({
      message,
      type: ToastType.SUCCESS,
      messageAlign: ToastMessageAlign.LEFT,
      fullWidth: false,
      dismissible: false,
    });
  }

  private _handleUnblock = async () => {
    const { tabName, unblock } = this.props;
    analyticsCollector.unblockNumber(this._source);
    analyticsCollector.phoneActions(tabName, PHONE_ITEM_ACTIONS.UNBLOCK);
    const result = await unblock();
    if (!result) {
      return;
    }
    this.notifyActionSuccess('phone.prompt.numberHasBeenUnblocked');
  }

  private _handleBlock = () => {
    const { t, tabName } = this.props;
    analyticsCollector.phoneActions(tabName, PHONE_ITEM_ACTIONS.BLOCK);
    const dialog = Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'blockNumberConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'blockNumberOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'blockNumberCancelButton' },
      title: t('phone.blockThisNumber'),
      content: (
        <JuiDialogContentText>
          {t('phone.numberWillNotBeAbletoReachYouIfBlockedDoYouWanttoBlockIt')}
        </JuiDialogContentText>
      ),
      size: 'small',
      okText: t('phone.block'),
      okType: 'negative',
      cancelText: t('common.dialog.cancel'),
      onOK: () => this.onBlockConfirm(dialog),
    });
  }

  onBlockConfirm = async (dialog: any) => {
    const { block } = this.props;
    dialog.startLoading();
    analyticsCollector.blockNumber(this._source);
    const result = await block();
    dialog.stopLoading();
    if (!result) {
      return false;
    }
    this.notifyActionSuccess('phone.prompt.numberHasBeenBlocked');
    return true;
  }

  _handleClick = async () => {
    const { isBlocked } = this.props;
    if (isBlocked) {
      await this._handleUnblock();
    } else {
      await this._handleBlock();
    }
  }

  get _source() {
    const { entity } = this.props;
    return SOURCE[entity];
  }

  get _text() {
    const { isBlocked, t } = this.props;
    return isBlocked ? t('phone.unblockNumber') : t('phone.blockNumber');
  }

  get _icon() {
    const { isBlocked } = this.props;
    return isBlocked ? 'unblocked' : 'blocked';
  }

  render() {
    const { type, entity } = this.props;
    return (
      <ActionButton
        key={`${entity}-block`}
        icon={this._icon}
        type={type}
        tooltip={this._text}
        onClick={this._handleClick}
        screenReader={this._text}
        automationId={`${entity}-block-button`}
      />
    );
  }
}

const BlockView = withTranslation('translations')(BlockViewComponent);

export { BlockView };
