/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-07-25 15:24:17
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { service, utils } from 'sdk';

import Entry from './Entry';
import { Handlers } from './types';

const MOUNT_NODE = document.getElementById('error') as HTMLElement;

const { ErrorTypes, BaseError } = utils;

class ErrorHandler {
  error: any;
  constructor(error: any) {
    this.error = error;
  }
  commonHandler(error: any) {
    if (1000 <= error.code && error.code < 2000) {
      console.error('Network', error);
    } else if (2000 <= error.code && error.code < 3000) {
      console.error('DB', error);
    } else {
      console.error(error);
    }
  }
  handle(handlers?: Handlers) {
    const { error } = this;
    console.log('service error:', error);
    if (!(error instanceof BaseError)) {
      console.error('Service Error: throw error format is wrong!');
      return this;
    }

    const handler = handlers
      ? handlers[error.code] || this.commonHandler
      : this.commonHandler;
    handler(error);
    return this;
  }

  hide() {
    ReactDOM.unmountComponentAtNode(MOUNT_NODE);
  }

  show() {
    ReactDOM.render(<Entry hide={this.hide} error={this.error} />, MOUNT_NODE);
  }
}

export default ErrorHandler;
