/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-17 14:15:47
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactNode } from 'react';

type MessageModuleBootstrapOptions = {
  extensions: ReactNode;
};

enum MESSAGE_TYPE {
  DIRECT_MESSAGE,
  MENTION,
  TEAM,
}

export { MessageModuleBootstrapOptions, MESSAGE_TYPE };
