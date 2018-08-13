/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-08-07 18:19:39
 * Copyright © RingCentral. All rights reserved.
 */
import { utils } from 'sdk';

interface Handlers {
  [key: string]: (error: utils.BaseError) => void;
};

export { Handlers };