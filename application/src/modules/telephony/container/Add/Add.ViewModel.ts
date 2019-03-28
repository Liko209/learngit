/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:59:17
 * Copyright © RingCentral. All rights reserved.
 */

import { StoreViewModel } from '@/store/ViewModel';
import { AddProps, AddViewProps } from './types';

class AddViewModel extends StoreViewModel<AddProps> implements AddViewProps {
  add = () => {};
}

export { AddViewModel };
