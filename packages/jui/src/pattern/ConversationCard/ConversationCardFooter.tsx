/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-09-11 14:26:52
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { spacing } from '../../foundation/utils';
import styled from '../../foundation/styled-components';

const StyledConversationCardFooter = styled('div')`
  padding: ${spacing(0, 4, 4, 0)};
`;

class JuiConversationCardFooter extends React.PureComponent {
  render() {
    const { children } = this.props;

    return (
      <StyledConversationCardFooter>{children}</StyledConversationCardFooter>
    );
  }
}

export { JuiConversationCardFooter };
