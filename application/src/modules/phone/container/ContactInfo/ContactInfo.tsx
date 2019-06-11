/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-30 15:44:14
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ContactInfoView } from './ContactInfo.View';
import { ContactInfoViewModel } from './ContactInfo.ViewModel';
import { ContactInfoProps } from './types';

const ContactInfo = buildContainer<ContactInfoProps>({
  View: ContactInfoView,
  ViewModel: ContactInfoViewModel,
});

export { ContactInfo };
