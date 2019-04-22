/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-06 14:31:51
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { observer } from 'mobx-react';
import { JuiIconButton } from 'jui/components/Buttons';
import { KeypadHeaderContainer } from 'jui/pattern/Dialer';
import { FakeInput } from '../FakeInput';
import { DialerKeypadHeaderViewProps } from './types';

@observer
class DialerKeypadHeaderView extends React.Component<
  DialerKeypadHeaderViewProps
> {
  render() {
    return (
      <KeypadHeaderContainer>
        <JuiIconButton
          variant="plain"
          color="common.white"
          disableToolTip={true}
          onClick={this.props.quitKeypad}
          size="large"
        >
          previous
        </JuiIconButton>
        <FakeInput />
      </KeypadHeaderContainer>
    );
  }
}

export { DialerKeypadHeaderView };
