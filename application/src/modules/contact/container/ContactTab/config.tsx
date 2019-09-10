/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-23 14:43:51
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { PageConfig, CellProps } from '@/modules/common/container/Layout';
import {
  CONTACT_TAB_TYPE,
  ContactFocHandler,
} from '@/store/handler/ContactFocHandler';
import { jupiter } from 'framework/Jupiter';

import { IContactStore } from '../../interface';
import { ContactCell } from '../ContactCell';
import EmptyPage from './img/illustrator.svg';
import { NavType } from './types';

const ITEM_HEIGHT = 64;

const ContactTabs: PageConfig = {
  rootPath: '/contacts',
  sections: [
    {
      title: 'contact.Contacts',
      tabs: [
        {
          title: 'contact.tab.allContacts',
          path: '/all-contacts',
          automationID: 'contacts-all-contacts',
          Cell: (props: CellProps) => (
            <ContactCell type={NavType.all} {...props} />
          ),
          minRowHeight: ITEM_HEIGHT,
          createHandler(searchKey: string) {
            const handler = new ContactFocHandler(
              CONTACT_TAB_TYPE.ALL,
              searchKey,
            );
            return handler.getFoc();
          },
          empty: {
            noResultTip: 'contact.noContacts',
            noResultImage: EmptyPage,
            noMatchesFoundTip: 'contact.noMatchesFound',
            noMatchesFoundImage: EmptyPage,
          },
          filter: {
            placeholder: 'contact.filterContacts',
            initFilterKey() {
              const store = jupiter.get<IContactStore>(IContactStore);
              return store.filterKey;
            },
            onChange(key: string) {
              const store = jupiter.get<IContactStore>(IContactStore);
              store.setFilterKey(key);
            },
          },
          onShowDataTrackingKey: 'Jup_Web/DT_contacts_allContacts',
        },
        {
          title: 'contact.tab.company',
          path: '/company',
          automationID: 'contacts-company',
          minRowHeight: ITEM_HEIGHT,
          Cell: (props: CellProps) => (
            <ContactCell type={NavType.company} {...props} />
          ),
          createHandler(searchKey: string) {
            const handler = new ContactFocHandler(
              CONTACT_TAB_TYPE.GLIP_CONTACT,
              searchKey,
            );
            return handler.getFoc();
          },
          empty: {
            noResultTip: 'contact.noContacts',
            noResultImage: EmptyPage,
            noMatchesFoundTip: 'contact.noMatchesFound',
            noMatchesFoundImage: EmptyPage,
          },
          filter: {
            placeholder: 'contact.filterContacts',
            initFilterKey() {
              const store = jupiter.get<IContactStore>(IContactStore);
              return store.filterKey;
            },
            onChange(key: string) {
              const store = jupiter.get<IContactStore>(IContactStore);
              store.setFilterKey(key);
            },
          },
          onShowDataTrackingKey: 'Jup_Web/DT_contacts_companyDirectory',
        },
      ],
    },
  ],
};

export { ContactTabs };
