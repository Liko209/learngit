import { Raw } from '../../framework/model';

/*
 * @Author: kasni.huang (kasni.huang@ringcentral.com)
 * @Date: 2019-03-15 16:17:53
 * Copyright © RingCentral. All rights reserved.
 */

enum SYNC_SOURCE {
  INDEX = 'SYNC_SOURCE.INDEX',
  INITIAL = 'SYNC_SOURCE.INITIAL',
  REMAINING = 'SYNC_SOURCE.REMAINING',
}

type ChangeModel = {
  entities: any[];
  partials?: Partial<Raw<any>>[];
};

export { SYNC_SOURCE, ChangeModel };
