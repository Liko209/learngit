/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-09 10:56:57
 * Copyright © RingCentral. All rights reserved.
 */
import { createContext, RefObject } from 'react';
import { JuiOutlineTextFieldRef } from 'jui/pattern/GlobalSearch';

const InputContext = createContext<RefObject<JuiOutlineTextFieldRef>>({
  current: null
});

export { InputContext };
