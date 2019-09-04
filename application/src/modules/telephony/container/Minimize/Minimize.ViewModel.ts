/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { TelephonyService } from '../../service';
import { StoreViewModel } from '@/store/ViewModel';
import { MinimizeProps, MinimizeViewProps } from './types';
import { TELEPHONY_SERVICE, INCOMING_STATE } from '../../interface/constant';
import { TelephonyStore } from '../../store';
import { computed } from 'mobx';

class MinimizeViewModel extends StoreViewModel<MinimizeProps>
  implements MinimizeViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  minimize = () => {
    this._telephonyService.minimize();
  };

  @computed
  get isForward() {
    return this._telephonyStore.incomingState === INCOMING_STATE.FORWARD;
  }
}

export { MinimizeViewModel };
