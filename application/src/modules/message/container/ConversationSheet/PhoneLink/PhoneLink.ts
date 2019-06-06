/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-05-27 10:20:48
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { PhoneLinkView } from './PhoneLink.View';
import { PhoneLinkViewModel } from './PhoneLink.ViewModel';
import { PhoneLinkProps } from './types';

const PhoneLink = buildContainer<PhoneLinkProps>({
  ViewModel: PhoneLinkViewModel,
  View: PhoneLinkView,
});

export { PhoneLink };
