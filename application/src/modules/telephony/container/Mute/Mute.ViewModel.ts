/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { TelephonyService } from '../../service';
import { MuteProps, MuteViewProps } from './types';
import { container } from 'framework';
import { observable, action } from 'mobx';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class MuteViewModel extends StoreViewModel<MuteProps> implements MuteViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  @observable
  isMute = false;

  @action
  muteOrUnmute = () => {
    this.isMute = !this.isMute;
    this._telephonyService.muteOrUnmute(this.isMute);
  }
}

export { MuteViewModel };
