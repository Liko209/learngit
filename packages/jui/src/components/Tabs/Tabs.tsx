/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 10:54:22
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import { StyledTabs } from './StyledTabs';
import { StyledTab } from './StyledTab';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import { JuiMenuList, JuiMenuItem } from '../Menus';
import { JuiPopperMenu } from '../../pattern/PopperMenu';

type States = {
  value: any;
  open: boolean;
};

type Props = {
  defaultActiveValue: any;
  children: JSX.Element[];
};

const CLASSES = {
  tabs: { root: 'root' },
  tab: {
    root: 'root',
    selected: 'selected',
    labelContainer: 'labelContainer',
    label: 'label',
  },
};

const MORE = 'MORE';

class JuiTabs extends PureComponent<Props, States> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: props.defaultActiveValue || 0,
      open: false,
    };
  }

  handleChangeTab = (event: React.MouseEvent<HTMLDivElement>, value: any) => {
    if (value === MORE) {
      return;
    }
    this.setState({ value });
  }

  handleMenuList = () => {
    this.setState((prevState: States) => ({
      open: !prevState.open,
    }));
  }

  renderMore = () => {
    const { open } = this.state;
    return (
      <JuiPopperMenu
        Anchor={this.renderMoreTab}
        placement="bottom-start"
        open={open}
      >
        {this.renderMoreMenu()}
      </JuiPopperMenu>
    );
  }

  renderMoreTab = () => {
    return (
      <StyledTab
        value={MORE}
        icon={<MoreHoriz />}
        classes={CLASSES.tab}
        onClick={this.handleMenuList}
      />
    );
  }

  renderMoreMenu = () => {
    return (
      <JuiMenuList onClick={this.handleMenuList}>
        <JuiMenuItem>123</JuiMenuItem>
        <JuiMenuItem>456</JuiMenuItem>
      </JuiMenuList>
    );
  }

  renderTab(titles: any[]) {
    return titles.map((title, index) => (
      <StyledTab
        value={index}
        label={title}
        classes={CLASSES.tab}
        key={index}
      />
    ));
  }

  render() {
    const { children } = this.props;
    const { value } = this.state;
    const titles: any[] = [];
    const containers: any[] = [];
    React.Children.forEach(children, (child: any) => {
      titles.push(child.props.title);
      containers.push(child);
    });
    return (
      <div>
        <StyledTabs
          value={value}
          onChange={this.handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          classes={CLASSES.tabs}
        >
          {this.renderTab(titles)}
          {this.renderMore()}
        </StyledTabs>
      </div>
    );
  }
}

export { JuiTabs };
