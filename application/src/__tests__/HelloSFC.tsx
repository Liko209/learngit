/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-12 15:17:15
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';

type HelloSFCProps = { message: string };

const HelloSFC = ({ message }: HelloSFCProps) => (
  <div id="hello" style={{ height: 20 }}>
    Hello {message}
  </div>
);

export { HelloSFC, HelloSFCProps };
