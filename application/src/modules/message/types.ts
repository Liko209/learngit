/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:15:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';

type MessageExtension = {
  'CONVERSATION_PAGE.HEADER.BUTTONS'?: ComponentType<{}>[];
  'CONVERSATION_PAGE.MESSAGE_INPUT.BUTTONS'?: ComponentType<{}>[];
  'CONVERSATION_LIST.MENU.BUTTONS'?: ComponentType<{}>[];
};

type MessageModuleBootstrapOptions = {
  extensions: MessageExtension[];
};

export { MessageExtension, MessageModuleBootstrapOptions };
