/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-16 17:54:39
 * Copyright © RingCentral. All rights reserved.
 */
import { createDecorator } from 'framework/ioc';

const IMessageNotificationManager = createDecorator(
  'IMessageNotificationManager',
);

interface IMessageNotificationManager {
  init(): void;
  dispose(): void;
}

export { IMessageNotificationManager };
