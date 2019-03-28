/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-01-10 16:21:50
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { Umi, UMI_SECTION_TYPE } from '@/containers/Umi';
import { observer } from 'mobx-react';
import { MessageUmiViewProps } from './types';

@observer
class MessageUmiView extends Component<MessageUmiViewProps> {
  render() {
    return <Umi type={UMI_SECTION_TYPE.ALL} global="UMI.app" />;
  }
}

export { MessageUmiView };
