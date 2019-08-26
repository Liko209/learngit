/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:48:36
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingSection } from '@/interface/setting';
import { StorePage } from '../../store/SettingStoreScope';

type SettingPageProps = {
  id: string;
};

type SettingPageViewProps = {
  page: StorePage;
  sectionIds: SettingSection['id'][];
};

export { SettingPageProps, SettingPageViewProps };
