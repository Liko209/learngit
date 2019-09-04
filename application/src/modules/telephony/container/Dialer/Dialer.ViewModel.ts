/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { container } from 'framework/ioc';
import { computed, action } from 'mobx';
import { i18nP } from '@/utils/i18nT';
import { DialerProps, DialerViewProps } from './types';
import { CALL_WINDOW_STATUS } from '../../FSM';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import { CALL_STATE } from 'sdk/module/telephony/entity';
import { analyticsCollector } from '@/AnalyticsCollector';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { alertE911Dialog } from '../E911Dialog';
import { DialerUIConfig } from '../../Dialer.config';

class DialerViewModel extends StoreViewModel<DialerProps>
  implements DialerViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _DialerUIConfig: DialerUIConfig = container.get(DialerUIConfig);

  dialerId = this._telephonyStore.dialerId;

  shouldShowConfirm = true;
  shouldShowPrompt = true;

  constructor(props: DialerProps) {
    super(props);
    this.reaction(
      () => this._telephonyStore.callState,
      callState => {
        if (callState === CALL_STATE.CONNECTING) {
          analyticsCollector.activeCall();
        }
      },
    );
    this.reaction(
      () => this.callWindowState,
      async (callWindowState: CALL_WINDOW_STATUS) => {
        if (
          !this.shouldDisplayDialer ||
          callWindowState === CALL_WINDOW_STATUS.MINIMIZED
        ) {
          return;
        }
        const needConfirmE911 = await this._telephonyService.needConfirmE911();
        const needE911Prompt = await this._telephonyService.needE911Prompt();
        if (needE911Prompt && this.shouldShowPrompt) {
          return this.showPromptDialog();
        }
        // getDialerMarked()
        // if user open e911 dialog and click cancel.
        // Next time open dialer not show confirm dialog
        if (
          needConfirmE911 &&
          this.shouldShowConfirm &&
          !this._DialerUIConfig.getDialerMarked()
        ) {
          return this.showConfirmDialog();
        }
      },
    );
  }

  @action
  showConfirmDialog() {
    alertE911Dialog({
      content: i18nP('telephony.prompt.emergencyAddressIsUnknown'),
      onOK: () => {
        this._telephonyService.openE911();
        this._DialerUIConfig.setDialerMarked(true);
      },
      onCancel: () => {
        this.shouldShowConfirm = false;
      },
      okText: i18nP('telephony.e911.confirmEmergencyAddress'),
      showCloseIcon: true,
    });
  }

  @action
  showPromptDialog() {
    alertE911Dialog({
      content: i18nP('telephony.prompt.e911ServiceMayBeLimitedOrUnavailable'),
      onOK: () => {
        this.shouldShowPrompt = false;
      },
      okText: i18nP('common.dialog.close'),
    });
  }

  @computed
  get isIncomingCall() {
    return this._telephonyStore.isIncomingCall;
  }

  @computed
  get callWindowState() {
    return this._telephonyStore.callWindowState;
  }

  @computed
  get keypadEntered() {
    return this._telephonyStore.keypadEntered;
  }

  @computed
  get startMinimizeAnimation() {
    return this._telephonyStore.startMinimizeAnimation;
  }

  @computed
  get dialerMinimizeTranslateX() {
    return this._telephonyStore.dialerMinimizeTranslateX;
  }

  @computed
  get dialerMinimizeTranslateY() {
    return this._telephonyStore.dialerMinimizeTranslateY;
  }

  @computed
  get shouldDisplayDialer() {
    return (
      this._telephonyStore.shouldDisplayDialer ||
      this._telephonyStore.isTransferPage
    );
  }

  @computed
  private get _hasCall() {
    return !!this._telephonyStore.uuid;
  }

  @computed
  get shouldDisplayCallCtrl() {
    return (
      (this._hasCall && !this.keypadEntered) ||
      this._telephonyStore.isWarmTransferPage
    );
  }
}

export { DialerViewModel };
