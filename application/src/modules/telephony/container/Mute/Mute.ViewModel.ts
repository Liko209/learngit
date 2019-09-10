/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { TelephonyService } from '../../service';
import { TelephonyStore } from '../../store';
import { MuteProps, MuteViewProps } from './types';
import { container } from 'framework/ioc';
import { computed } from 'mobx';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class MuteViewModel extends StoreViewModel<MuteProps> implements MuteViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  @computed
  get isMute() {
    return this._telephonyStore.isMute;
  }

  muteOrUnmute = () => {
    this._telephonyService.muteOrUnmute();
  }
}

export { MuteViewModel };
