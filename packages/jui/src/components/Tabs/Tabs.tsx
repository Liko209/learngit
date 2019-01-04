/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 10:54:22
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import RootRef from '@material-ui/core/RootRef';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import { StyledTabs } from './StyledTabs';
import { StyledTab, StyledTabProps } from './StyledTab';
import { JuiTabProps } from './Tab';
import { JuiPopperMenu } from '../../pattern/PopperMenu';
import { JuiMenuList, JuiMenuItem } from '../Menus';

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
  // position: 'absolute',
  // right: 0,
};

class JuiTabs extends PureComponent<Props, States> {
  // not include more tab
  private _tabTitles: (string | JSX.Element)[] = [];
  private _tabRefs: React.RefObject<HTMLElement>[] = [];
  private _tabWidths: number[] = [];
  private _tabWidthsTotal: number = 0;
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
    this._measureTabWidths();
    this._moreWidth = this._moreRef.current!.getBoundingClientRect().width;
    this._containerWidth =
      this._containerRef.current!.getBoundingClientRect().width - 16; // reduce padding
    console.log('tabs', `_containerWidth: ${this._containerWidth}`);
    console.log('tabs', `_moreWidth: ${this._moreWidth}`);
    this._calculateIndexTabsAndIndexMenus();
    // todo resize listener
  }

  private _measureTabWidths = () => {
    this._tabWidths = this._tabRefs.map(
      (_ref: React.RefObject<HTMLElement>) => {
        if (_ref.current) {
          const width = _ref.current.getBoundingClientRect().width;
          this._tabWidthsTotal += width;
          return width;
        }
        return 0;
      },
    );
    console.log('tabs', `_tabWidths: ${this._tabWidths}`);
    console.log('tabs', `_tabWidthsTotal: ${this._tabWidthsTotal}`);
  }

  private _calculateIndexTabsAndIndexMenus = () => {
    const { indexSelected } = this.state; // current selected tab index
    let indexTabs: number[] = [];
    const indexMenus: number[] = [];
    if (this._tabWidthsTotal < this._containerWidth) {
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

  private _handleChangeTab = (
    event: React.MouseEvent<HTMLDivElement>,
    indexSelected: any,
  ) => {
    if (indexSelected === MORE) {
      return;
    }
    this.setState({ indexSelected });
  }

  private _showMenuList = () => {
    this.setState({
      openMenu: true,
    });
  }

  private _hideMenuList = () => {
    this.setState({
      openMenu: false,
    });
  }

  private _handleMenuItemClick = (index: number, event: React.MouseEvent) => {
    this.setState({ indexSelected: index });
  }

  private _renderTabMoreAndMenuList = () => {
    const { indexMenus, openMenu } = this.state;
    if (indexMenus.length === 0) {
      return null;
    }
    return (
      <JuiPopperMenu
        Anchor={this._renderTabMore}
        placement="bottom-start"
        open={openMenu}
      >
        <JuiMenuList onClick={this._hideMenuList}>
          {indexMenus.map((item: number) => (
            <JuiMenuItem
              key={item}
              onClick={this._handleMenuItemClick.bind(this, item)}
            >
              {this._tabTitles[item]}
            </JuiMenuItem>
          ))}
        </JuiMenuList>
      </JuiPopperMenu>
    );
  }

  private _renderTabMore = () => {
    return (
      <RootRef rootRef={this._moreRef}>
        {this._renderStyledTab({
          value: MORE,
          icon: <MoreHoriz />,
          onClick: this._showMenuList,
          style: STYLE,
        })}
      </RootRef>
    );
  }

  private _renderTab = () => {
    const { indexTabs } = this.state;
    const tabs = indexTabs.map((item: number) =>
      this._renderStyledTab({ value: item, label: this._tabTitles[item] }),
    );
    const tabMoreAndMenuList = this._renderTabMoreAndMenuList();
    if (tabMoreAndMenuList) {
      tabs.push(tabMoreAndMenuList);
    }
    return tabs;
  }

  private _renderStyledTab = ({
    value,
    label,
    icon,
    onClick,
    style,
  }: StyledTabProps) => {
    return (
      <StyledTab
        value={value}
        key={value}
        label={label}
        icon={icon}
        onClick={onClick}
        classes={CLASSES.tab}
        style={style}
      />
    );
  }

  private _renderAllTab = () => {
    const { children } = this.props;
    const tabItems = React.Children.map(
      children,
      (child: React.ReactElement<JuiTabProps>, index: number) => (
        <RootRef rootRef={this._tabRefs[index]} key={index}>
          {this._renderStyledTab({ value: index, label: child.props.title })}
        </RootRef>
      ),
    );
    tabItems.push(this._renderTabMore()); // add more tab
    return tabItems;
  }

  componentDidUpdate(prevProps: Props, prevState: States) {
    const { indexTabs, indexMenus } = prevState;
    if (
      indexTabs.length > 0 &&
      indexMenus.length > 0 &&
      !this.state.indexTabs.includes(this.state.indexSelected)
    ) {
      this._calculateIndexTabsAndIndexMenus();
    }
  }

  render() {
    const { indexSelected, indexTabs, indexMenus } = this.state;
    // first execute render indexTabs & indexMenus length equal 0
    if (
      indexTabs.length > 0 &&
      indexMenus.length > 0 &&
      !indexTabs.includes(indexSelected)
    ) {
      return null; // select menu list tab
    }
    return (
      <div ref={this._containerRef}>
        <StyledTabs
          value={indexSelected}
          onChange={this._handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          classes={CLASSES.tabs}
        >
          {indexTabs.length === 0 && indexMenus.length === 0
            ? this._renderAllTab()
            : this._renderTab()}
        </StyledTabs>
      </div>
    );
  }
}

export { JuiTabs };
