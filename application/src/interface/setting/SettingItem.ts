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
  SLIDER,
}

type DataTracking = {
  eventName?: string;
  type: string;
  name: string;
  endPoint?: string;
  optionTransform?: (value: any) => string;
};

type SettingItem = {
  /**
   * The unique id
   */
  id: number;

  /**
   * automationId for E2E
   */
  automationId: string;

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

  /**
   * Will be called before the Setting Save
   */
  beforeSaving?: (settingValue: any) => Promise<boolean> | boolean | void;

  /**
   * Data Tracking parameters
   */
  dataTracking?: DataTracking;
};

export { SettingItem, SETTING_ITEM_TYPE, DataTracking };
