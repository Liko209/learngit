/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { TelephonyService } from '../../service';
import { StoreViewModel } from '@/store/ViewModel';
import { MinimizeProps, MinimizeViewProps } from './types';
import { TELEPHONY_SERVICE } from '../../interface/constant';

class MinimizeViewModel extends StoreViewModel<MinimizeProps>
  implements MinimizeViewProps {
  private _telephonyService: TelephonyService = container.get(
    TELEPHONY_SERVICE,
  );

  minimize = () => {
    this._telephonyService.minimize();
  }
}

export { MinimizeViewModel };
