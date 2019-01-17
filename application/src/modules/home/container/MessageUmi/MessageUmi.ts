/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-10 16:25:54
 * Copyright © RingCentral. All rights reserved.
 */
import { buildContainer } from '@/base';
import { MessageUmiView } from './MessageUmi.View';
import { MessageUmiViewModel } from './MessageUmi.ViewModel';
import { MessageUmiProps } from './types';

const MessageUmi = buildContainer<MessageUmiProps>({
  View: MessageUmiView,
  ViewModel: MessageUmiViewModel,
});

export { MessageUmi, MessageUmiProps };
