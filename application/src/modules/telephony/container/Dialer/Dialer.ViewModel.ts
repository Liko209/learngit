/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { DialerProps, DialerViewProps } from './types';

class DialerViewModel extends StoreViewModel<DialerProps>
  implements DialerViewProps {}

export { DialerViewModel };
