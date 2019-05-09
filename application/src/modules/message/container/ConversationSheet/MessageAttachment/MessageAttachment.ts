/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 09:57:59
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MessageAttachmentView } from './MessageAttachment.View';
import { MessageAttachmentViewModel } from './MessageAttachment.ViewModel';
import { MessageAttachmentProps } from './types';

const MessageAttachment = buildContainer<MessageAttachmentProps>({
  View: MessageAttachmentView,
  ViewModel: MessageAttachmentViewModel,
});

export { MessageAttachment };
