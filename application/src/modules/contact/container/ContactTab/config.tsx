/*
 * @Author: isaac.liu
 * @Date: 2019-05-27 10:12:56
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { LeftNav } from '@/modules/common/container/Layout';

const ContactTabs: LeftNav = {
  rootPath: '/contacts',
  sections: [
    {
      title: 'contact.Contacts',
      tabs: [
        {
          title: 'contact.tab.allContacts',
          path: '/all-contacts',
          automationID: 'contacts-tab-all-contacts',
          component: () => <div>1</div>,
        },
        {
          title: 'contact.tab.company',
          path: '/company',
          automationID: 'contacts-tab-company',
          component: () => <div>2</div>,
        },
      ],
    },
  ],
};

export { ContactTabs };
