/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-11 00:26:09
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MessageLayoutView } from './MessageLayout.View';
import { MessageLayoutViewModel } from './MessageLayout.ViewModel';
import { MessageLayoutProps } from './types';

const MessageLayout = buildContainer<MessageLayoutProps>({
  View: MessageLayoutView,
  ViewModel: MessageLayoutViewModel,
});

export { MessageLayout, MessageLayoutProps };
