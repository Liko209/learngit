/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { StoreViewModel } from '@/store/ViewModel';
import { RecordProps, RecordViewProps } from './types';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { computed } from 'mobx';
import {
  RECORD_STATE,
} from '../../FSM';

class RecordViewModel extends StoreViewModel<RecordProps>
  implements RecordViewProps {
  private _telephonyService: TelephonyService = container.get(TelephonyService);
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get disabled() {
    return this._telephonyStore.recordState === RECORD_STATE.DISABLED;
  }

  @computed
  get recording() {
    return this._telephonyStore.recordState === RECORD_STATE.RECORDING;
  }

  get isOnline() {
    return window.navigator.onLine;
  }

  handleClick = () => {
    if (!this.isOnline) {
      return;
    }
    this._telephonyService.startOrStopRecording();
  }
}

export { RecordViewModel };
