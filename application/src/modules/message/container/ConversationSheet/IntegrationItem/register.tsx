/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 10:05:11
 * Copyright © RingCentral. All rights reserved.
 */
import GlipTypeUtil from 'sdk/utils/glip-type-dictionary/util';
import { IntegrationItem } from './index';

export default {
  priority: 0,
  component: IntegrationItem,
  type: GlipTypeUtil.isIntegrationType,
};
