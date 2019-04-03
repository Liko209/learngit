/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 11:23:12
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JuiListItem, JuiListItemProps } from './ListItem';
import styled from '../../foundation/styled-components';

type Props = {
  render: (hover: boolean) => any; // any is children
} & JuiListItemProps;

type States = {
  hover: boolean;
};

const StyledListItem = styled(JuiListItem)`
  && {
    :hover {
      cursor: auto;
    }
  }
`;

class JuiListItemWithHover extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = { hover: false };
  }

  handleMouseOver = () => {
    if (!this.state.hover) {
      this.setState({ hover: true });
    }
  }

  handleMouseOut = (event: React.MouseEvent) => {
    const { target, currentTarget, relatedTarget } = event;
    if (
      !currentTarget.contains(target as Node) ||
      !currentTarget.contains(relatedTarget as Node)
    ) {
      this.setState({ hover: false });
    }
  }

  render() {
    const { render, ...rest } = this.props;
    return (
      <StyledListItem
        {...rest}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      >
        {render(this.state.hover)}
      </StyledListItem>
    );
  }
}

export { JuiListItemWithHover };
