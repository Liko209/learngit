/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 18:56:05
 * Copyright © RingCentral. All rights reserved.
 */
import { jupiter } from 'framework/Jupiter';
import { IContactStore } from '../IContactStore';

jest.unmock('../IContactStore');

class ContactStore implements IContactStore {
  currentUrl: string = '';
  filterKey = '';
  setCurrentUrl = jest.fn();
  setFilterKey = jest.fn();
}

jupiter.registerService(IContactStore, ContactStore);

export { IContactStore };
