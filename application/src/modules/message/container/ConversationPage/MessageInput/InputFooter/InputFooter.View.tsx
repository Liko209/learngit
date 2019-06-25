/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-24 09:46:29
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiInputFooterContainer } from 'jui/pattern/MessageInput/InputFooter';
import { observer } from 'mobx-react';
import { InputFooterViewProps } from './types';
import { MarkupTips } from './FooterItems';

@observer
class InputFooterView extends React.Component<InputFooterViewProps> {
  render() {
    const { showMarkupTips } = this.props;
    return (
      <JuiInputFooterContainer>
        <MarkupTips show={showMarkupTips} />
      </JuiInputFooterContainer>
    );
  }
}

export { InputFooterView };
