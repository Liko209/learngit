/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:51:43
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { SettingPageView } from './SettingPage.View';
import { SettingPageViewModel } from './SettingPage.ViewModel';
import { SettingPageProps } from './types';

const SettingPage = buildContainer<SettingPageProps>({
  View: SettingPageView,
  ViewModel: SettingPageViewModel,
});

export { SettingPage, SettingPageProps };
