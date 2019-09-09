/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 15:33:20
 * Copyright © RingCentral. All rights reserved.
 */
import { StoreViewModel } from '@/store/ViewModel';
import { action } from 'mobx';

import { ContactTabProps } from './types';
import { IContactStore } from '../../interface';

class ContactTabRouterViewModel extends StoreViewModel<ContactTabProps> {
  @IContactStore contactStore: IContactStore;

  @action
  updateCurrentUrl = (path: string) => {
    this.contactStore.setCurrentUrl(path);
  };

  dispose() {
    this.contactStore.setFilterKey('');
  }
}

export { ContactTabRouterViewModel };
