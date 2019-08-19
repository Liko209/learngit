/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { StoreViewModel } from '@/store/ViewModel';
import { RecordProps, RecordViewProps } from './types';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { computed } from 'mobx';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class RecordViewModel extends StoreViewModel<RecordProps>
  implements RecordViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get disabled() {
    return this._telephonyStore.recordDisabled;
  }

  @computed
  get recording() {
    return this._telephonyStore.isRecording;
  }

  get isOnline() {
    return window.navigator.onLine;
  }

  handleClick = () => {
    if (!this.isOnline) {
      return;
    }
    this._telephonyService.startOrStopRecording();
  };
}

export { RecordViewModel };
