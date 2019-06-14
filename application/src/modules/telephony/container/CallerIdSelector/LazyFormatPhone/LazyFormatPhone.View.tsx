/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-06-13 14:20:09
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { LazyFormatViewPhoneProps } from './types';

@observer
export class LazyFormatPhoneView extends Component<LazyFormatViewPhoneProps> {
  render() {
    return <span>{this.props.formattedPhoneNumber}</span>;
  }
}
