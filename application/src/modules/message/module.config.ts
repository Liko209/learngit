/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:20:22
 * Copyright © RingCentral. All rights reserved.
 */
import { MessageService } from './service';
import { MessageStore } from './store';
import { MessageModule } from './MessageModule';

const config = {
  entry: MessageModule,
  provides: [MessageStore, MessageService],
};

export { config };
