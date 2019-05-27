/*
 * @Author: Thomas Yang(thomas.yang@ringcentral.com)
 * @Date: 2019-05-02 10:53:56
 * Copyright © RingCentral. All rights reserved.
 */

import { IdModel } from '..';

enum ESettingItemState {
  ENABLE,
  DISABLE,
  INVISIBLE,
}

type BaseSettingEntity = IdModel & {
  weight: number;
  state: ESettingItemState;
  parentModelId?: number;
};

export { BaseSettingEntity, ESettingItemState };
