/*
 * @Author: Jerry Cai (jerry.cai@ringcentral.com)
 * @Date: 2018-12-07 14:35:00
 */

import { Progress, ItemFile } from '../../models';
import { RequestHolder } from '../../api/requestHolder';

type ItemFileUploadStatus = {
  progress: Progress;
  requestHolder: RequestHolder;
  itemFile?: ItemFile;
  file?: File;
};

export { ItemFileUploadStatus };
