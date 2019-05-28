/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:48:36
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingPage, SettingSection } from '@/interface/setting';

type SettingPageProps = {
  id: string;
};

type SettingPageViewProps = {
  page?: SettingPage;
  sections: SettingSection[];
};

export { SettingPageProps, SettingPageViewProps };
