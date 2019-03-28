/*
 * @Author: Thomas thomas.yang@ringcentral.com
 * @Date: 2019-01-14 16:34:09
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
