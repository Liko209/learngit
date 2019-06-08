/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-29 14:31:35
 * Copyright © RingCentral. All rights reserved.
 */
import { SETTING_PAGE__GENERAL, SETTING_SECTION__GENERAL } from './constant';
import {
  SETTING_ITEM_TYPE,
  SettingPage,
  SettingSection,
  SettingItem,
} from '@/interface/setting';

function buildGeneralPageAndSection() {
  const page = buildPage(SETTING_PAGE__GENERAL);
  page.sections.push(buildSection(SETTING_SECTION__GENERAL));
  return page;
}

function buildPage(
  id: SettingPage['id'] = SETTING_PAGE__GENERAL,
  sections: SettingSection[] = [],
): SettingPage {
  return {
    id,
    sections,
    automationId: 'automationPage_' + id,
    title: 'setting.page_' + id,
    path: '/' + id,
    weight: 0,
  };
}

function buildSection(
  id: SettingSection['id'],
  items: SettingItem[] = [],
): SettingSection {
  return {
    id,
    items,
    automationId: 'automationSection_' + id,
    title: 'setting.section_' + id,
    description: 'setting.description_' + id,
    weight: 0,
  };
}

function buildItem(id: SettingItem['id']): SettingItem {
  return {
    id,
    title: 'setting.item_' + id,
    automationId: 'automationItem_' + id,
    description: 'setting.description_' + id,
    type: SETTING_ITEM_TYPE.SELECT,
    weight: 0,
  };
}

export { buildGeneralPageAndSection, buildPage, buildSection, buildItem };
