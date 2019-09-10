/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 16:00:47
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, action } from 'mobx';
// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { TelephonyStore } from '../../store';
import { container } from 'framework/ioc';
import { analyticsCollector } from '@/AnalyticsCollector';

class RecentCallBtnViewModel extends StoreViewModel<Props>
  implements ViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get shouldShowRecentCallOrBackBtn() {
    return this._telephonyStore.isRecentCalls;
  }

  @computed
  get shouldShowRecentCallBtn() {
    return this._telephonyStore.shouldDisplayRecentCalls;
  }

  @action
  jumpToRecentCall = () => {
    analyticsCollector.recentCallLogs();
    this._telephonyStore.jumpToRecentCall();
  };

  @action
  backToDialer = () => {
    this._telephonyStore.backToDialer();
  };
}

export { RecentCallBtnViewModel };
