/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-06-26 14:55:18
 * Copyright © RingCentral. All rights reserved.
 */

import { computed, observable, action } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props } from './types';
import { RecentCallLogsHandler } from './RecentCallLogsHandler';
import { IndexRange } from 'jui/components/VirtualizedList';

const InitIndex = -1;

class RecentCallsViewModel extends StoreViewModel<Props> {
  @observable focusIndex: number = InitIndex;
  @observable
  isError = false;
  @observable
  private _recentCallLogsHandler: RecentCallLogsHandler | undefined;
  @observable startIndex: number = 0;
  @observable stopIndex: number = 0;

  constructor() {
    super();
    const recentCallLogsHandler = new RecentCallLogsHandler();
    recentCallLogsHandler.init().then(() => {
      this._recentCallLogsHandler = recentCallLogsHandler;
    });
  }

  @action
  increaseFocusIndex = () => {
    const next = this.focusIndex + 1;
    const maxIndex = this.recentCallIds.length - 1;
    this.focusIndex = next >= maxIndex ? maxIndex : next;
  }

  @action
  decreaseFocusIndex = () => {
    const next = this.focusIndex - 1;
    const minimumIndex = 0;
    this.focusIndex = next <= minimumIndex ? minimumIndex : next;
  }

  @action
  setRangeIndex = (range: IndexRange) => {
    this.startIndex = range.startIndex;
    this.stopIndex = range.stopIndex;
  }

  @computed
  get listHandler() {
    return this._recentCallLogsHandler && this._recentCallLogsHandler.foc;
  }

  @computed
  get recentCallIds() {
    return this._recentCallLogsHandler
      ? this._recentCallLogsHandler.recentCallIds
      : [];
  }

  @action
  onErrorReload = () => {
    this.isError = false;
  }

  dispose = () => {
    this._recentCallLogsHandler && this._recentCallLogsHandler.dispose();
  }
}

export { RecentCallsViewModel };
