/*
 * @Author: Andy Hu
 * @Date: 2018-09-17 14:01:06
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { ConversationStreamView } from './ConversationStream.View';
import { ConversationStreamViewModel } from './ConversationStream.ViewModel';
import { InfiniteListPlugin } from '@/plugins';
import { ConversationStreamProps } from './types';

const ConversationStream = buildContainer<ConversationStreamProps>({
  View: ConversationStreamView,
  ViewModel: ConversationStreamViewModel,
  plugins: [
    new InfiniteListPlugin({
      initialScrollTop: 99999,
      stickTo: 'bottom',
    }),
  ],
});

export { ConversationStream };
export default ConversationStream;
