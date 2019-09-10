/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-22 14:16:11
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { container } from 'framework/ioc';
import { computed, observable, action, comparer } from 'mobx';
import { Props, ViewProps } from './types';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import { CALL_WINDOW_STATUS } from '../../FSM';
import { TELEPHONY_SERVICE } from '../../interface/constant';
import { formatSeconds } from '@/utils/date';
import { CALL_STATE } from 'sdk/module/telephony/entity';
import { FeaturesFlagsService } from '@/modules/featuresFlags/service';

class DialpadViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  private _featuresFlagsService: FeaturesFlagsService = container.get(
    FeaturesFlagsService,
  );

  id = this._telephonyStore.dialpadBtnId;

  constructor(props: Props) {
    super(props);
    this.reaction(
      () => ({
        showMinimized: this.showMinimized,
        activeCallTime: this._telephonyStore.activeCallTime,
      }),
      ({ showMinimized, activeCallTime }) => {
        if (!showMinimized) {
          this.dispose();
        }
        if (showMinimized) {
          if (!this._intervalId && activeCallTime) {
            this._createInterval();
            this._seconds = Number(
              `${Date.now() - activeCallTime}`.slice(0, -3),
            );
          }
        }
      },
      {
        equals: comparer.structural,
      },
    );
  }

  maximize = () => {
    this._telephonyService.maximize();
  };

  @computed
  get name() {
    return this._telephonyStore.displayName;
  }

  @computed
  get direction() {
    return this._telephonyStore.activeCallDirection;
  }

  @computed
  private get _callState() {
    return this._telephonyStore.callState;
  }

  @computed
  private get _callWindowState() {
    return this._telephonyStore.callWindowState;
  }

  @computed
  get showMinimized() {
    return (
      (this._callState === CALL_STATE.CONNECTING ||
        this._callState === CALL_STATE.CONNECTED) &&
      this._callWindowState === CALL_WINDOW_STATUS.MINIMIZED
    );
  }

  @observable
  private _seconds = 0;

  @computed
  private get _timing() {
    const { secondTime, hourTime, minuteTime } = formatSeconds(this._seconds);
    let result = `${minuteTime}:${secondTime}`;
    if (hourTime !== '00') {
      result = `${hourTime}:${result}`;
    }
    return result;
  }

  private _intervalId?: NodeJS.Timeout;

  @action.bound
  private _createInterval() {
    const { activeCallTime } = this._telephonyStore;
    if (activeCallTime) {
      this._intervalId = setInterval(() => {
        this._seconds = Number(`${Date.now() - activeCallTime}`.slice(0, -3));
      }, 1000);
    }
  }

  @computed
  get timing() {
    const { activeCallTime } = this._telephonyStore;
    if (!activeCallTime) {
      return { key: 'common.Connecting' };
    }
    return this._timing;
  }

  @computed
  get canUseTelephony() {
    return this._featuresFlagsService.canIUseTelephony;
  }

  @computed
  get startMinimizeAnimation() {
    return this._telephonyStore.startMinimizeAnimation;
  }

  @computed
  get isConference() {
    return this._telephonyStore.isConference;
  }

  dispose = () => {
    this._intervalId && clearInterval(this._intervalId);
    this._intervalId = undefined;
  };
}

export { DialpadViewModel };
