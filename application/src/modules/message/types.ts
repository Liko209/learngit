/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:15:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ComponentType } from 'react';
import { JuiIconButtonProps } from 'jui/components/Buttons';

type MessageExtension = {
  'CONVERSATION_PAGE.HEADER.BUTTONS'?: ComponentType<JuiIconButtonProps>[];
  'CONVERSATION_PAGE.MESSAGE_INPUT.BUTTONS'?: ComponentType<
    JuiIconButtonProps
  >[];
  'CONVERSATION_LIST.MENU.BUTTONS'?: ComponentType<JuiIconButtonProps>[];
};

type MessageModuleBootstrapOptions = {
  extensions: MessageExtension[];
};

export { MessageExtension, MessageModuleBootstrapOptions };
