/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-06-03 14:02:16
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable } from 'mobx';
import { IContactStore } from '../interface';

class ContactStore implements IContactStore {
  @observable currentUrl: string = '/contacts/all-contacts';

  @action
  setCurrentUrl(url: string) {
    this.currentUrl = url;
  }
}

export { ContactStore };
