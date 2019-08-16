/*
 * @Author: Jeffrey Huang
 * @Date: 2019-05-30 18:21:13
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { FlipProps, FlipViewProps } from './types';
import { observable, computed } from 'mobx';
import { container } from 'framework/ioc';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';
import { RCInfoService, ForwardingFlipNumberModel } from 'sdk/module/rcInfo';
import { Notification } from '@/containers/Notification';
import { defaultNotificationOptions } from '@/common/catchError';
import { generalErrorHandler } from '@/utils/error';
import { TelephonyStore } from '../../../store';
import { TelephonyService } from '../../../service';
import { TELEPHONY_SERVICE } from '../../../interface/constant';
import { CALL_STATE } from 'sdk/module/telephony/entity';
import { analyticsCollector } from '@/AnalyticsCollector';

class FlipViewModel extends StoreViewModel<FlipProps> implements FlipViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _rcInfoService = ServiceLoader.getInstance<RCInfoService>(
    ServiceConfig.RC_INFO_SERVICE,
  );

  @observable
  flipNumbers: ForwardingFlipNumberModel[] = [];

  constructor(props: FlipProps) {
    super(props);
    this._fetchFlipNumbers();
  }

  @computed
  get canUseFlip() {
    const hasFlipNumbers = !!this.flipNumbers.length;
    const unHold = !this._telephonyStore.held;
    const isConnecting =
      this._telephonyStore.callState === CALL_STATE.CONNECTING;
    return hasFlipNumbers && unHold && !isConnecting;
  }

  flip = async (flipNumber: number) => {
    analyticsCollector.flipCall();
    try {
      await this._telephonyService.flip(flipNumber);
    } catch (error) {
      this._onActionError(error);
    }
  }

  private _onActionError(error: any) {
    Notification.flashToast({
      ...defaultNotificationOptions,
      message: 'telephony.prompt.FlipBackendError',
    });
    generalErrorHandler(error);
  }

  private async _fetchFlipNumbers() {
    analyticsCollector.flipNumberList();
    this.flipNumbers = await this._rcInfoService.getFlipNumberList();
  }
}

export { FlipViewModel };
