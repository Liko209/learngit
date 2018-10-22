/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:07:02
 * Copyright © RingCentral. All rights reserved.
 */

import { buildContainer } from '@/base';
import { MessageInputView } from './MessageInput.View';
import { MessageInputViewModel } from './MessageInput.ViewModel';
import { MessageInputProps } from './types';

const MessageInput = buildContainer<MessageInputProps>({
  View: MessageInputView,
  ViewModel: MessageInputViewModel,
});

export { MessageInput };
