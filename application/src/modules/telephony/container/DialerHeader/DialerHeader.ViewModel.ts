/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 16:31:49
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { DialerHeaderProps, DialerHeaderViewProps } from './types';
import { GLOBAL_KEYS } from '@/store/constants';
import { getGlobalValue } from '@/store/utils';

class DialerHeaderViewModel extends StoreViewModel<DialerHeaderProps>
  implements DialerHeaderViewProps {
  name = 'Terry Webster';
  phone = this.props.phoneNumber;
  uid = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
}

export { DialerHeaderViewModel };
