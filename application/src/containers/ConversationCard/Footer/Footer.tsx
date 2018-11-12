/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { FooterView } from './Footer.View';
import { FooterViewModel } from './Footer.ViewModel';
import { FooterProps } from './types';

const Footer = buildContainer<FooterProps>({
  View: FooterView,
  ViewModel: FooterViewModel,
});

export { Footer };
