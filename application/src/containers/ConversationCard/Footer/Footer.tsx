/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:52:01
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { FooterView } from './Footer.View';
import { FooterViewModel } from './Footer.ViewModel';
import { withPostLike } from './withPostLike';
import { FooterViewModelProps } from './types';
import { withTranslation } from 'react-i18next';

const Container = buildContainer<FooterViewModelProps>({
  View: FooterView,
  ViewModel: FooterViewModel,
});

const Footer = withTranslation('translations')(withPostLike(Container));

export { Footer };
