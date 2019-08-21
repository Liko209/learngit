/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { KeypadProps, KeypadViewProps } from './types';
import { container } from 'framework/ioc';
import { TelephonyStore } from '../../store';

class KeypadViewModel extends StoreViewModel<KeypadProps> implements KeypadViewProps {
  private _telephonyStore: TelephonyStore = container.get(TelephonyStore);

  keypad = () => this._telephonyStore.openKeypad();
}

export { KeypadViewModel };
