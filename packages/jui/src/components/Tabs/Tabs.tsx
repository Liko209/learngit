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
  value: number;
  open: boolean;
  indexTabItems: number[];
  indexMenuItems: number[]; // length > 0, has more tab
};

type Props = {
  defaultActiveValue: number;
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
  right: '0px',
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
      (child: React.ReactElement<JuiTabProps>, index: number) => {
        this._tabTitles.push(child.props.title); // add tab title
        return React.createRef(); // add tab ref
      },
    );
    this._moreRef = React.createRef();
    this._containerRef = React.createRef();
    this.state = {
      value: props.defaultActiveValue || 0,
      open: false,
      indexTabItems: [],
      indexMenuItems: [],
    };
  }

  componentDidMount() {
    this.initItemsWidth();
    this._containerWidth =
      this._containerRef.current!.getBoundingClientRect().width - 16; // reduce padding
    this._moreWidth = this._moreRef.current!.getBoundingClientRect().width;
    this.setTab();
    // todo resize
  }

  initItemsWidth = () => {
    this._tabWidths = this._tabRefs.map(
      (_ref: React.RefObject<HTMLElement>) => {
        if (_ref.current) {
          return _ref.current.getBoundingClientRect().width;
        }
        return 0;
      },
    );
    console.log(1111111, this._tabWidths);
  }

  setTab = () => {
    const { value } = this.state; // current selected tab index
    const allTabWidth = this._tabWidths.reduce((a: number, b: number) => a + b);
    console.log(1111111, allTabWidth);
    console.log(1111111, this._containerWidth);
    if (allTabWidth < this._containerWidth) {
      // 0. show all tab, there is no more tab
      const indexTabItems = this._tabWidths.map(
        (width: number, index: number) => index,
      );
      this.setState({ indexTabItems, indexMenuItems: [] });
    } else {
      // 0. there must be more tab
      const indexTabItems: number[] = [];
      // 1. add more tab width
      let sum = this._moreWidth;
      // 2. add selected tab index
      if (sum + this._tabWidths[value] < this._containerWidth) {
        indexTabItems.push(value);
        sum += this._tabWidths[value];
      }
      // 3. add order tab index
      for (let i = 0, len = this._tabWidths.length; i < len; i++) {
        if (i === value) {
          continue;
        }
        const width = this._tabWidths[i];
        if (sum + width < this._containerWidth) {
          indexTabItems.push(i);
          sum += width;
        } else {
          break;
        }
      }
      // 5. except
      const indexMenuItems: number[] = [];
      this._tabWidths.forEach((width: number, index: number) => {
        if (!indexTabItems.includes(index)) {
          indexMenuItems.push(index);
        }
      });
      indexTabItems.sort(); // change original array
      console.log(1111111, indexTabItems, indexMenuItems);
      this.setState({
        indexMenuItems,
        indexTabItems,
      });
    }
  }

  handleChangeTab = (event: React.MouseEvent<HTMLDivElement>, value: any) => {
    if (value === MORE) {
      return;
    }
    this.setState({ value });
  }

  showMenuList = () => {
    this.setState({
      open: true,
    });
  }

  hideMenuList = () => {
    this.setState({
      open: false,
    });
  }

  handleMenuItemClick = (event: React.MouseEvent, index: number) => {
    const { indexTabItems } = this.state;
    const baseIndex = indexTabItems.length;
    this.setState({ value: baseIndex + index });
  }

  renderTabMoreAndMenuList = () => {
    const { indexMenuItems, open } = this.state;
    if (indexMenuItems.length === 0) {
      return null;
    }
    return (
      <JuiPopperMenu
        Anchor={this.renderTabMore}
        placement="bottom-start"
        open={open}
      >
        <JuiMenuList onClick={this.hideMenuList}>
          {indexMenuItems.map((item: number, index: number) => (
            <JuiMenuItem
              key={index}
              onClick={event => this.handleMenuItemClick(event, index)}
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
    const { indexTabItems } = this.state;
    const tabs = indexTabItems.map((item: number, index: number) => (
      <StyledTab
        value={index}
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
      (child: any, index: number) => (
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
    const { value, indexTabItems, indexMenuItems } = this.state;
    return (
      <div ref={this._containerRef}>
        <StyledTabs
          value={value}
          onChange={this.handleChangeTab}
          indicatorColor="primary"
          textColor="primary"
          classes={CLASSES.tabs}
        >
          {indexTabItems.length === 0 && indexMenuItems.length === 0
            ? this.renderInitAllTabItems()
            : this.renderTabItems()}
        </StyledTabs>
      </div>
    );
  }
}

export { JuiTabs };
