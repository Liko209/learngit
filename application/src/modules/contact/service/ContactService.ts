/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 17:14:29
 * Copyright © RingCentral. All rights reserved.
 */
import { IContactService, IContactStore } from '../interface';

class ContactService implements IContactService {
  @IContactStore contactStore: IContactStore;

  getCurrentUrl() {
    return this.contactStore.currentUrl;
  }
}

export { ContactService };
