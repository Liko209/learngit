/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 16:27:15
 * Copyright © RingCentral. All rights reserved.
 */
import { SettingItem } from './SettingItem';

type SettingSection = {
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
   * The i18n key of description
   */
  description?: string;

  /**
   * The weight of this section which can
   * be used for sorting setting sections
   */
  weight: number;

  /**
   * Items in this section
   */
  items: SettingItem[];
};

export { SettingSection };
