/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2019-03-02 16:45:07
 * Copyright © RingCentral. All rights reserved.
 */

import { ModelIdType } from 'sdk/framework/model';

export default interface IUsedCache<IdType extends ModelIdType = number> {
  getUsedIds(): IdType[];
}
