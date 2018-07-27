/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-03-22 18:54:32
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import ReactDOM from 'react-dom';

import Entry from './Entry';

const MOUNT_NODE = document.getElementById('error');

class ErrorHandle {
  constructor(error) {
    this.error = error;
  }

  show() {
    ReactDOM.render(<Entry hide={this.hide} error={this.error} />, MOUNT_NODE);
  }

  hide() {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
  }
}

export default ErrorHandle;
