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
import RootRef from '@material-ui/core/RootRef';
import { JuiTabProps } from './Tab';

type States = {
  openMenu: boolean;
  indexSelected: number;
  indexTabs: number[];
  indexMenus: number[]; // length > 0, has more tab
};

type Props = {
  defaultActiveIndex: number;
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

const STYLE: React.CSSProperties = {
  position: 'absolute',
  right: 0,
};

class JuiTabs extends PureComponent<Props, States> {
  // not include more tab
  private _tabTitles: (string | JSX.Element)[] = [];
  private _tabRefs: React.RefObject<HTMLElement>[] = [];
  private _tabWidths: number[] = [];
  // more tab
  private _moreRef: React.RefObject<HTMLElement>;
  private _moreWidth: number = 0;
  // right rail container
  private _containerRef: React.RefObject<HTMLDivElement>;
  private _containerWidth: number = 0;

  constructor(props: Props) {
    super(props);
    this._tabRefs = React.Children.map(
      props.children,
      (child: React.ReactElement<JuiTabProps>) => {
        this._tabTitles.push(child.props.title); // add tab title
        return React.createRef(); // add tab ref
      },
    );
    this._moreRef = React.createRef();
    this._containerRef = React.createRef();
    this.state = {
      indexSelected: props.defaultActiveIndex || 0,
      openMenu: false,
      indexTabs: [],
      indexMenus: [],
    };
  }

  componentDidMount() {
    this.getTabWidths();
    this._containerWidth =
      this._containerRef.current!.getBoundingClientRect().width - 16; // reduce padding
    this._moreWidth = this._moreRef.current!.getBoundingClientRect().width;
    this.calculateIndexTabsAndIndexMenus();
    // todo resize
  }

  getTabWidths = () => {
    this._tabWidths = this._tabRefs.map(
      (_ref: React.RefObject<HTMLElement>) => {
        if (_ref.current) {
          return _ref.current.getBoundingClientRect().width;
        }
        return 0;
      },
    );
  }

  calculateIndexTabsAndIndexMenus = () => {
    const { indexSelected } = this.state; // current selected tab index
    const allTabWidth = this._tabWidths.reduce((a: number, b: number) => a + b);
    console.log(
      'tabs',
      `_tabWidths: ${this._tabWidths}`,
      `_containerWidth: ${this._containerWidth}`,
      `allTabWidth: ${allTabWidth}`,
    );
    let indexTabs: number[] = [];
    const indexMenus: number[] = [];
    if (allTabWidth < this._containerWidth) {
      // 0. there is no more tab, show all tab
      indexTabs = this._tabWidths.map((width: number, index: number) => index);
    } else {
      // 0. there must be more tab
      // 1. add more tab width
      let sum = this._moreWidth;
      // 2. add selected tab index
      if (sum + this._tabWidths[indexSelected] < this._containerWidth) {
        indexTabs.push(indexSelected);
        sum += this._tabWidths[indexSelected];
      }
      // 3. add order tab index
      this._tabWidths.forEach((width: number, index: number) => {
        if (index === indexSelected) {
          return; // continue
        }
        if (sum + width < this._containerWidth) {
          indexTabs.push(index); // add to tab list
        } else {
          indexMenus.push(index); // 4. add to menu list
        }
        sum += width;
      });
      // 5. change original array
      indexTabs.sort();
    }
    console.log('tabs', `indexTabs: ${indexTabs}`, `indexMenus: ${indexMenus}`);
    this.setState({
      indexMenus,
      indexTabs,
    });
  }

  handleChangeTab = (
    event: React.MouseEvent<HTMLDivElement>,
    indexSelected: any,
  ) => {
    if (indexSelected === MORE) {
      return;
    }
    this.setState({ indexSelected });
  }

  showMenuList = () => {
    this.setState({
      openMenu: true,
    });
  }

  hideMenuList = () => {
    this.setState({
      openMenu: false,
    });
  }

  handleMenuItemClick = (event: React.MouseEvent, index: number) => {
    this.setState({ indexSelected: index });
  }

  renderTabMoreAndMenuList = () => {
    const { indexMenus, openMenu } = this.state;
    if (indexMenus.length === 0) {
      return null;
    }
    return (
      <JuiPopperMenu
        Anchor={this.renderTabMore}
        placement="bottom-start"
        open={openMenu}
      >
        <JuiMenuList onClick={this.hideMenuList}>
          {indexMenus.map((item: number) => (
            <JuiMenuItem
              key={item}
              onClick={event => this.handleMenuItemClick(event, item)}
            >
              {this._tabTitles[item]}
            </JuiMenuItem>
          ))}
        </JuiMenuList>
      </JuiPopperMenu>
    );
  }

  renderTabMore = () => {
    return (
      <RootRef rootRef={this._moreRef}>
        <StyledTab
          value={MORE}
          icon={<MoreHoriz />}
          classes={CLASSES.tab}
          onClick={this.showMenuList}
          style={STYLE}
        />
      </RootRef>
    );
  }

  renderTabItems = () => {
    const { indexTabs } = this.state;
    const tabs = indexTabs.map((item: number, index: number) => (
      <StyledTab
        value={item}
        label={this._tabTitles[item]}
        classes={CLASSES.tab}
        key={index}
      />
    ));
    const tabMoreAndMenuList = this.renderTabMoreAndMenuList();
    if (tabMoreAndMenuList) {
      tabs.push(tabMoreAndMenuList);
    }
    return tabs;
  }

  renderInitAllTabItems = () => {
    const { children } = this.props;
    const tabItems = React.Children.map(
      children,
      (child: React.ReactElement<JuiTabProps>, index: number) => (
        <RootRef rootRef={this._tabRefs[index]} key={index}>
          <StyledTab
            value={index}
            label={child.props.title}
            classes={CLASSES.tab}
            key={index}
          />
        </RootRef>
      ),
    );
    tabItems.push(this.renderTabMore()); // add more tab
    return tabItems;
  }

  render() {
    const { indexSelected, indexTabs, indexMenus } = this.state;
    return (
      <div ref={this._containerRef}>
        <StyledTabs
          value={indexSelected}
          onChange={this.handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          classes={CLASSES.tabs}
        >
          {indexTabs.length === 0 && indexMenus.length === 0
            ? this.renderInitAllTabItems()
            : this.renderTabItems()}
        </StyledTabs>
      </div>
    );
  }
}

export { JuiTabs };
