/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-27 12:42:03
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingPage, SettingSection } from '@/interface/setting';

function emptySectionFilter(section: SettingSection) {
  return section.items.length > 0;
}

function emptyPageFilter(page: SettingPage) {
  return page.sections.filter(emptySectionFilter).length > 0;
}

export { emptySectionFilter, emptyPageFilter };
