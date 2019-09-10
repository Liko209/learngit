/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-07-10 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { TypeDictionary } from 'sdk/utils';

enum VIEWER_ITEM_TYPE {
  IMAGE_FILES,
}

const ViewerItemTypeIdMap = {
  [VIEWER_ITEM_TYPE.IMAGE_FILES]: TypeDictionary.TYPE_ID_FILE,
};

export { VIEWER_ITEM_TYPE, ViewerItemTypeIdMap };
