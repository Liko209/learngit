/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 11:23:12
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { JuiListItem, JuiListItemProps } from './ListItem';

type Props = {
  render: (state: States) => any; // any is children
} & JuiListItemProps;

type States = {
  hover: boolean;
};

class JuiListItemWithHover extends React.PureComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = { hover: false };
  }

  handleMouseEnter = () => {
    this.setState({ hover: true });
  }

  handleMouseLeave = () => {
    this.setState({ hover: false });
  }

  render() {
    const { render, ...rest } = this.props;
    return (
      <JuiListItem
        {...rest}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        {render(this.state)}
      </JuiListItem>
    );
  }
}

export { JuiListItemWithHover };
