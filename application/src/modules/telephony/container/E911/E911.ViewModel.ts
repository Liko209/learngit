/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-23 14:24:51
 * Copyright © RingCentral. All rights reserved.
 */
// import { computed } from 'mobx';
import { ChangeEvent } from 'react';
import { StoreViewModel } from '@/store/ViewModel';
import { E911Props, E911ViewProps } from './types';

class E911ViewModel extends StoreViewModel<E911Props> implements E911ViewProps {
  handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value, '---nello');
  };
}

export { E911ViewModel };
