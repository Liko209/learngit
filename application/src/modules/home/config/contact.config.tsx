/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-09 10:28:56
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { SubModuleConfig } from '../types';
import { JuiIconography } from 'jui/foundation/Iconography';

const config: SubModuleConfig = {
  route: {
    path: '/contacts',
    component: () => <div>Contacts</div>,
  },
  nav: async () => ({
    url: '/contacts',
    Icon: <JuiIconography iconSize="medium">contacts_border</JuiIconography>,
    IconSelected: <JuiIconography iconSize="medium">contacts</JuiIconography>,
    title: 'contact.Contacts',
    placement: 'bottom',
  }),
};

export { config };
