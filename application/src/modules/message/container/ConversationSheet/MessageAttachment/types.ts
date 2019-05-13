/*
 * @Author: isaac.liu
 * @Date: 2019-05-03 09:55:24
 * Copyright © RingCentral. All rights reserved.
 */
import { InteractiveMessageItem } from 'sdk/module/item/entity';

type MessageAttachmentProps = {
  ids: number[];
};

type MessageAttachmentViewProps = {
  items: InteractiveMessageItem[];
};

export { MessageAttachmentProps, MessageAttachmentViewProps };
