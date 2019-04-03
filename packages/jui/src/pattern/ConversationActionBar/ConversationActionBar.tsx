/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 11:18:14
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent } from 'react';
import styled from '../../foundation/styled-components';

import { spacing, palette, height, width } from '../../foundation/utils/styles';

type Props = {
  More: React.ReactNode;
  Like: React.ReactNode;
  Bookmark: React.ReactNode;
  Pin: React.ReactNode;
};

const StyledWrapper = styled('div')`
  && {
    display: flex;
    align-items: center;
    position: absolute;
    right: ${spacing(2)};
    top: ${spacing(1.5)};
    height: ${height(7)};
    padding: 0 ${spacing(1.5)};
    border-radius: ${spacing(4)};
    background-color: ${palette('common', 'white')};
    transition: box-shadow 0.3s ease-in;
    box-shadow: ${props => props.theme.shadows[1]};
    &:hover {
      box-shadow: ${props => props.theme.shadows[5]};
    }
    & button {
      width: ${width(7)};
      height: ${height(7)};
      justify-content: center;
    }
  }
`;

class JuiConversationActionBar extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.clickHandler = this.clickHandler.bind(this);
  }

  clickHandler(evt: React.MouseEvent) {
    evt.stopPropagation();
  }

  render() {
    const { More, Like, Bookmark, Pin } = this.props;
    return (
      <StyledWrapper onClick={this.clickHandler}>
        {Like}
        {Bookmark}
        {Pin}
        {More}
      </StyledWrapper>
    );
  }
}

export { JuiConversationActionBar };
