/*
 * @Author: looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-05-30 09:40:39
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import portalManager from '@/common/PortalManager';
import { FileNameEditDialogView } from './FileNameEditDialog.View';
import { FileNameEditDialogViewModel } from './FileNameEditDialog.ViewModel';
import { FileNameEditDialogProps } from './types';

const FileNameEditDialogContainer = buildContainer<FileNameEditDialogProps>({
  View: FileNameEditDialogView,
  ViewModel: FileNameEditDialogViewModel,
});
const FileNameEditDialog = portalManager.wrapper(FileNameEditDialogContainer);
export { FileNameEditDialog };
