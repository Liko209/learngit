/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { DetachOrAttachProps, DetachOrAttachViewProps } from './types';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class DetachOrAttachViewModel extends StoreViewModel<DetachOrAttachProps>
  implements DetachOrAttachViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  detachOrAttach = () => {
    this._telephonyService.handleWindow();
  }

  @computed
  get isDetached() {
    return this._telephonyStore.isDetached;
  }
}

export { DetachOrAttachViewModel };
