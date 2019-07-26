/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-07-23 01:48:27
 * Copyright © RingCentral. All rights reserved.
 */
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { action, observable, computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { getGlobalValue, getPresence } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { analyticsCollector } from '@/AnalyticsCollector';
import { PRESENCE } from 'sdk/module/presence/constant';
import { catchError } from '@/common/catchError';
import { PresenceService } from 'sdk/module/presence';
import { DndBannerProps, DndBannerViewProps } from './types';

class DndBannerViewModel extends StoreViewModel<DndBannerProps> implements DndBannerViewProps {
  private _presenceService = ServiceLoader.getInstance<PresenceService>(
    ServiceConfig.PRESENCE_SERVICE,
  );

  @observable
  isClosed = false;

  @computed
  get currentUserId() {
    return getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
  }

  @computed
  get isDND() {
    const presence = getPresence(this.currentUserId);
    return presence === PRESENCE.DND;
  }

  @computed
  get isShow() {
    return !this.isClosed && this.isDND;
  }

  @catchError.flash({
    network: 'presence.prompt.updatePresenceFailedForNetworkIssue',
    server: 'presence.prompt.updatePresenceFailedForServerIssue',
  })
  @action
  handleUnblock = async () => {
    const toPresence = PRESENCE.AVAILABLE;
    analyticsCollector.setPresence(toPresence);
    await this._presenceService.setPresence(toPresence);
  };

  @action
  handleClose = () => {
    this.isClosed = true;
  };
}

export { DndBannerViewModel };
