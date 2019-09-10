/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 16:28:36
 * Copyright © RingCentral. All rights reserved.
 */
import { createDecorator } from 'framework/ioc';
import { SettingPage } from './SettingPage';
import { SettingSection } from './SettingSection';
import { SettingItem } from './SettingItem';

const ISettingService = createDecorator('ISettingService');

interface ISettingService {
  /**
   * Register a new setting page
   * @param scope     Unique scope to store the
   *                  registered page
   * @param page
   */
  registerPage(scope: symbol, page: SettingPage): void;

  /**
   * Register a new setting section into a setting page
   * @param scope     Unique scope to store the
   *                  registered section
   * @param pageId    The setting page id which the
   *                  section will be register to
   * @param section   The setting section
   */
  registerSection(scope: symbol, pageId: string, section: SettingSection): void;

  /**
   * Register a new setting section into a setting section
   * @param scope     Unique scope to store the
   *                  registered item
   * @param sectionId The setting section id which the
   *                  setting item will register to
   * @param item      The setting item
   * @param component A custom component for the
   *                  setting item
   */
  registerItem(scope: symbol, sectionId: string, item: SettingItem): void;

  /**
   * Unregister all pages/sections/items in the scope
   * @param scope     Will unRegister all stuffs in scope
   */
  unRegisterAll(scope: symbol): void;

  goToSettingPage(pageId: string, options?: { replace?: boolean }): void;
}

export { ISettingService };
