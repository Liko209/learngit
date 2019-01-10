/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-10 16:21:50
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { Umi } from '@/containers/Umi';
import { MessageUmiViewProps } from './types';

class MessageUmiView extends Component<MessageUmiViewProps> {
  render() {
    const { groupIds } = this.props;
    return <Umi ids={groupIds} global="UMI.app" />;
  }
}

export { MessageUmiView };
