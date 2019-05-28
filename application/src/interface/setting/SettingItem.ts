/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-05-19 16:26:17
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';

enum SETTING_ITEM_TYPE {
  TOGGLE,
  SELECT,
  LINK,
}

type SettingItem = {
  /**
   * The unique id
   */
  id: number;

  /**
   * The i18n key of title
   */
  title?: string;

  /**
   * The i18n key of description
   */
  description?: string;

  /**
   * The weight of this item which can
   * be used for sorting setting items
   */
  weight: number;
  /**
   * The custom error handler. When it
   * was given, there will be not default
   * save fail toast notification any more.
   */
  errorHandler?: (error: Error) => void;
  /**
   * The component type or component used for render this item
   */
  type: SETTING_ITEM_TYPE | ComponentType<{ id: SettingItem['id'] }>;
};

export { SettingItem, SETTING_ITEM_TYPE };
