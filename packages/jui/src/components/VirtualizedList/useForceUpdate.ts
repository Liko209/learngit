/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-02-28 15:01:09
 * Copyright © RingCentral. All rights reserved.
 */
import { useReducer } from 'react';

const useForceUpdate = () => {
  const [updateTrigger, setValue] = useReducer(x => x + 1, 0);
  const forceUpdate = () => {
    setValue({});
  };
  return { updateTrigger, forceUpdate };
};

export { useForceUpdate };
