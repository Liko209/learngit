/*
 * @Author: isaac.liu (isaac.liu@ringcentral.com)
 * @Date: 2018-12-06 16:48:23
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent, ReactNode } from 'react';
import styled from '../../foundation/styled-components';

type Props = {
  children: ReactNode[] | ReactNode;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  white-space: nowrap;
  flex-wrap: nowrap;
  flex-shrink: 0;
`;

class MessageActionBar extends PureComponent<Props> {
  render() {
    const { children } = this.props;
    return <Wrapper>{children}</Wrapper>;
  }
}

export { MessageActionBar };
