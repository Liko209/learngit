/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-19 18:42:36
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AttachmentManagerView } from './AttachmentManager.View';
import { AttachmentsViewModel } from './Attachments.ViewModel';
import { AttachmentsProps } from './types';

const AttachmentManager = buildContainer<AttachmentsProps>({
  View: AttachmentManagerView,
  ViewModel: AttachmentsViewModel,
});

export { AttachmentManager };
