/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-25 07:16:52
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PresenceService } from 'sdk/module/presence';
import { PRESENCE } from 'sdk/module/presence/constant';
import { getGlobalValue, getPresence } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ActivityTimerProps, ActivityTimerViewProps } from './types';

class ActivityTimerViewModel extends StoreViewModel<ActivityTimerProps>
  implements ActivityTimerViewProps {
  private _presenceService = ServiceLoader.getInstance<PresenceService>(
    ServiceConfig.PRESENCE_SERVICE,
  );

  @observable
  isOffline: boolean = false;

  constructor(props: ActivityTimerProps) {
    super(props);
    if (window.jupiterElectron) {
      window.jupiterElectron.setOffline = this.setOffline;
      window.jupiterElectron.setOnline = this.setOnline;
    }
  }

  @action
  setOffline = async () => {
    if (this.presence !== PRESENCE.AVAILABLE) {
      return;
    }
    await this._presenceService.setAutoPresence(PRESENCE.UNAVAILABLE);
    this.isOffline = true;
  };

  @action
  setOnline = async () => {
    if (!this.isOffline) {
      return;
    }
    await this._presenceService.setAutoPresence(PRESENCE.AVAILABLE);
    this.isOffline = false;
  };

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @computed
  get presence() {
    return getPresence(this.currentUserId);
  }
}

export { ActivityTimerViewModel };
