/*
 * @Author: Peng Yu (peng.yu@ringcentral.com)
 * @Date: 2019-05-29 17:10:31
 * Copyright © RingCentral. All rights reserved.
 */

// import { computed, observable, action } from 'mobx';
// import { ENTITY_NAME } from '@/store';
// import { getEntity } from '@/store/utils';
import { StoreViewModel } from '@/store/ViewModel';
import { Props, ViewProps } from './types';
import { container } from 'framework';
import { TELEPHONY_SERVICE } from '@/modules/telephony/interface/constant';
import { TelephonyService } from '@/modules/telephony/service';

class ParkViewModel extends StoreViewModel<Props> implements ViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  park = () => {
    this._telephonyService.park();
  }
}

export { ParkViewModel };
