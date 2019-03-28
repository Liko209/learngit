/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { computed } from 'mobx';
import { StoreViewModel } from '@/store/ViewModel';
import { DetachOrAttachProps, DetachOrAttachViewProps } from './types';
import { TelephonyStore } from '../../store';
import { TelephonyService } from '../../service';

class DetachOrAttachViewModel extends StoreViewModel<DetachOrAttachProps>
  implements DetachOrAttachViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);
  private _telephonyService: TelephonyService = container.get(TelephonyService);

  detachOrAttach = () => {
    this._telephonyService.handleWindow();
  }

  @computed
  get isDetached() {
    return this._telephonyStore.isDetached;
  }
}

export { DetachOrAttachViewModel };
