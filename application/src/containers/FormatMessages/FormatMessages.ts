/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-10-25 17:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { FormatMessagesView } from './FormatMessages.View';
import { FormatMessagesViewModel } from './FormatMessages.ViewModel';

const FormatMessages = buildContainer<{postId : number}>({
  ViewModel: FormatMessagesViewModel,
  View: FormatMessagesView,
});

export { FormatMessages };
