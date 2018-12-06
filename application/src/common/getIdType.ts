/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-05 16:03:32
 * Copyright © RingCentral. All rights reserved.
 */

import { GlipTypeUtil } from 'sdk/utils';

const getIdType = (id: number) => {
  return GlipTypeUtil.extractTypeId(id);
};

export { getIdType };
