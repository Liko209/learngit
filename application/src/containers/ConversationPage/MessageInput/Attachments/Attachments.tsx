/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-11 09:51:21
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { AttachmentsView } from './Attachments.View';
import { AttachmentsViewModel } from './Attachments.ViewModel';
import { AttachmentsProps } from './types';

const Attachments = buildContainer<AttachmentsProps>({
  View: AttachmentsView,
  ViewModel: AttachmentsViewModel,
});

export { Attachments };
