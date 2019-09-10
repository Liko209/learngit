/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 16:28:30
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingSection } from './SettingSection';

type SettingPage = {
  /**
   * The `unique id
   */
  id: string;

  /**
   * automationId for E2E
   */
  automationId: string;

  /**
   * The i18n key of title
   */
  title: string;

  /**
   * The path of this page
   */
  path: string;

  /**
   * The icon of this page
   */
  icon?: string;

  /**
   * The weight of this item which can
   * be used for sorting setting items
   */
  weight: number;

  /**
   * Sections in this page
   */
  sections: SettingSection[];

  /**
   * data in this page
   */
  dataTracking?: { name: string };
};

export { SettingPage };
