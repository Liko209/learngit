/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-30 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { TypeDictionary } from 'sdk/utils';
import { Meeting } from './Meeting';

export default {
  priority: 0,
  component: Meeting,
  type: TypeDictionary.TYPE_ID_MEETING,
};
