/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-21 11:23:12
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { JuiListItem, JuiListItemProps } from './ListItem';

type Props = {
  render: (hover: boolean) => any; // any is children
} & JuiListItemProps;

type States = {
  hover: boolean;
};

class JuiListItemWithHover extends Component<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = { hover: false };
  }

  handleMouseOver = () => {
    if (!this.state.hover) {
      this.setState({ hover: true });
    }
  };

  handleMouseOut = (event: React.MouseEvent) => {
    const { target, currentTarget, relatedTarget } = event;
    if (
      !currentTarget.contains(target as Node) ||
      !currentTarget.contains(relatedTarget as Node)
    ) {
      this.setState({ hover: false });
    }
  };
  /* eslint-disable sx-a11y/mouse-events-have-key-events */
  render() {
    const { render, ...rest } = this.props;
    return (
      <JuiListItem
        {...rest}
        onMouseOver={this.handleMouseOver}
        onMouseOut={this.handleMouseOut}
      >
        {render(this.state.hover)}
      </JuiListItem>
    );
  }
}

export { JuiListItemWithHover };
