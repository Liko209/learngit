/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { jupiter } from 'framework/Jupiter';
import { JuiIconography } from 'jui/foundation/Iconography';
import { lazyComponent } from '@/modules/common/util/lazyComponent';
import { IContactService } from '@/modules/contact/interface';
import { SubModuleConfig } from '../types';

function getUrl() {
  const contactService = jupiter.get<IContactService>(IContactService);
  return contactService.getCurrentUrl();
}

const config: SubModuleConfig = {
  route: {
    path: '/contacts',
    component: lazyComponent({
      loader: () =>
        import(/* webpackChunkName: "c.contacts" */ './lazy/Contacts'),
    }),
  },
  nav: async () => ({
    url: getUrl,
    Icon: <JuiIconography iconSize="medium">contacts_border</JuiIconography>,
    IconSelected: <JuiIconography iconSize="medium">contacts</JuiIconography>,
    title: 'contact.Contacts',
    placement: 'bottom',
  }),
};

export { config };
