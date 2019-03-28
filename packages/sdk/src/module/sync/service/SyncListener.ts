/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2019-02-25 13:27:00
 * Copyright © RingCentral. All rights reserved.
 */

import { IndexDataModel } from '../../../api/glip/user';

type SyncListener = {
  onInitialLoaded?: (indexData: IndexDataModel) => Promise<void>;
  onInitialHandled?: () => Promise<void>;
  onRemainingLoaded?: (indexData: IndexDataModel) => Promise<void>;
  onRemainingHandled?: () => Promise<void>;
  onIndexLoaded?: (indexData: IndexDataModel) => Promise<void>;
  onIndexHandled?: () => Promise<void>;
};

export { SyncListener };
