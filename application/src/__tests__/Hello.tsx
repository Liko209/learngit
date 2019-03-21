/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-03-12 15:17:15
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';

type HelloProps = { message: string };

class Hello extends Component<HelloProps> {
  render() {
    return (
      <div id="hello" style={{ height: 20 }}>
        Hello {this.props.message}
      </div>
    );
  }
}
export { Hello, HelloProps };
