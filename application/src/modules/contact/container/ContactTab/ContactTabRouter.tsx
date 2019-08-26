/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-08-20 16:20:33
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';

import { ContactTabRouterView } from './ContactTabRouter.View';
import { ContactTabRouterViewModel } from './ContactTabRouter.ViewModel';
import { ContactTabProps } from './types';

const ContactTabRouter = buildContainer<ContactTabProps>({
  View: ContactTabRouterView,
  ViewModel: ContactTabRouterViewModel,
});

export { ContactTabRouter };
