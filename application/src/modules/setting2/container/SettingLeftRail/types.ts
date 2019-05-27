/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 10:48:36
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingPage } from '@/interface/setting';

type SettingLeftRailProps = {};

type SettingLeftRailViewProps = {
  pages: SettingPage[];
  currentPage?: SettingPage;
  goToSettingPage(pageId: string): void;
};

export { SettingLeftRailProps, SettingLeftRailViewProps };
