/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-25 17:08:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

const JuiAutoSizer = ({ children }: any) => {
  return <div>{children({ width: 200, height: 200 })}</div>;
};

export { JuiAutoSizer };
