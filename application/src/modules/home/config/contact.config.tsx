/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import i18next from 'i18next';
import { SubModuleConfig } from '../types';

const config: SubModuleConfig = {
  route: {
    path: '/contacts',
    component: () => <div>Contacts</div>,
  },
  nav: () => ({
    url: '/contacts',
    icon: 'contacts_border',
    title: i18next.t('contact.Contacts'),
    placement: 'bottom',
  }),
};

export { config };
