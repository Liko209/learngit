/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:03:39
 * Copyright © RingCentral. All rights reserved.
 */
import { observable } from 'mobx';
import { MessageExtension } from '../types';
class MessageStore {
  @observable extensions: MessageExtension[] = [];

  addExtension(extension: MessageExtension) {
    this.extensions.push(extension);
  }
}

export { MessageStore };
