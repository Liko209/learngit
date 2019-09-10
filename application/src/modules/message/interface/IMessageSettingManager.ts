/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-07-16 16:43:15
 * Copyright © RingCentral. All rights reserved.
 */
import { createDecorator } from 'framework/ioc';

const IMessageSettingManager = createDecorator('IMessageSettingManager');

interface IMessageSettingManager {
  init: Function;
  dispose: Function;
}

export { IMessageSettingManager };
