/*
 * @Author: Peng Yu (peng.yu@ringcentral.com)
 * @Date: 2019-05-29 17:10:31
 * Copyright © RingCentral. All rights reserved.
 */

// import { computed, observable, action } from 'mobx';
// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { container } from 'framework/ioc';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { TelephonyService } from '@/modules/telephony/service';
import { TelephonyStore } from '../../../store';
import { CALL_STATE } from 'sdk/module/telephony/entity';

class ParkViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  park = () => {
    this._telephonyService.park();
  }

  @computed
  get disabled() {
    return (
      this._telephonyStore.callState === CALL_STATE.CONNECTING ||
      this._telephonyStore.held
    );
  }
}

export { ParkViewModel };
