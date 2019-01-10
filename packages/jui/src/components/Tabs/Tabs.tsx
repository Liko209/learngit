/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 10:54:22
 * Copyright © RingCentral. All rights reserved.
 */

import React, {
  PureComponent,
  ReactElement,
  createRef,
  RefObject,
  CSSProperties,
  MouseEvent,
  Children,
} from 'react';
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import { StyledTabs } from './StyledTabs';
import { StyledTab, StyledTabProps } from './StyledTab';
import { StyledContainer } from './StyledContainer';
import { StyledWrapper } from './StyledWrapper';
import { JuiTabProps } from './Tab';
import { JuiPopperMenu } from '../../pattern/PopperMenu';
import { JuiMenuList, JuiMenuItem } from '../Menus';

type States = {
  openMenu: boolean;
  indexSelected: number; // selected tab index
  indexTabs: number[]; // show tab index
  indexMenus: number[]; // menu tab index, when length > 0, then it has more tab
  indexLazyLoadComponents: number[]; // lazy load container component index
};

type Props = {
  width?: number; // resize
  tag?: string; // If there is a tag props, save it locally
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

const MORE = 10000; // more tab mui auto add child index

const STYLE: CSSProperties = {
  position: 'absolute',
  right: 0,
};

class JuiTabs extends PureComponent<Props, States> {
  // not include more tab
  private _tabTitles: (string | JSX.Element)[] = [];
  private _tabRefs: RefObject<HTMLElement>[] = [];
  private _tabWidths: number[] = [];
  private _tabWidthsTotal: number = 0;
  // more tab
  private _moreRef: RefObject<HTMLElement>;
  private _moreWidth: number = 0;
  // right rail container
  private _containerRef: RefObject<any>;
  private _containerWidth: number = 0;

  constructor(props: Props) {
    super(props);
    this._tabRefs = Children.map(
      props.children,
      (child: ReactElement<JuiTabProps>) => {
        this._tabTitles.push(child.props.title); // add tab title
        return createRef(); // add tab ref
      },
    );
    this._moreRef = createRef();
    this._containerRef = createRef();

    let indexSelected =
      this._getLocalSelectedIndex() || props.defaultActiveIndex || 0;
    if (indexSelected > Children.count(props.children) - 1) {
      indexSelected = 0;
    }
    this.state = {
      indexSelected,
      indexLazyLoadComponents: [indexSelected],
      openMenu: false,
      indexTabs: [],
      indexMenus: [],
    };
  }

  componentDidMount() {
    this._measureMoreWidth();
    this._measureContainerWidth();
    this._measureTabWidths();
    this._calculateIndexTabsAndIndexMenus();
  }

  private _measureMoreWidth = () => {
    const domMore = this._moreRef.current;
    if (domMore) {
      this._moreWidth = domMore.getBoundingClientRect().width;
    }
    // console.log('tabs', `_moreWidth: ${this._moreWidth}`);
  }

  private _measureContainerWidth = () => {
    const domContainer = this._containerRef.current;
    if (domContainer) {
      const cs = window.getComputedStyle(domContainer);
      const paddingX =
        parseFloat(cs.paddingLeft!) + parseFloat(cs.paddingRight!);
      const borderX =
        parseFloat(cs.borderLeftWidth!) + parseFloat(cs.borderRightWidth!);
      this._containerWidth = domContainer.offsetWidth - paddingX - borderX;
    }
    // console.log('tabs', `_containerWidth: ${this._containerWidth}`);
  }

  private _measureTabWidths = () => {
    this._tabWidthsTotal = 0;
    this._tabWidths = this._tabRefs.map((_ref: RefObject<HTMLElement>) => {
      if (_ref.current) {
        const width = _ref.current.getBoundingClientRect().width;
        this._tabWidthsTotal += width;
        return width;
      }
      return 0;
    });
    // console.log('tabs', `_tabWidths: ${this._tabWidths}`);
    // console.log('tabs', `_tabWidthsTotal: ${this._tabWidthsTotal}`);
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
    // console.log('tabs', `indexTabs: ${indexTabs}`, `indexMenus: ${indexMenus}`);
    this.setState({
      indexMenus,
      indexTabs,
    });
  }

  private _handleChangeTab = (event: MouseEvent, indexSelected: number) => {
    if (indexSelected === MORE) {
      return;
    }
    this._setSelectedTabIndex(indexSelected);
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

  private _handleMenuItemClick = (index: number, event: MouseEvent) => {
    this._setSelectedTabIndex(index);
  }

  private _setSelectedTabIndex = (indexSelected: number) => {
    let { indexLazyLoadComponents } = this.state;
    const { tag } = this.props;
    if (!indexLazyLoadComponents.includes(indexSelected)) {
      indexLazyLoadComponents = indexLazyLoadComponents.concat(indexSelected);
    }
    this.setState({ indexSelected, indexLazyLoadComponents });
    if (tag) {
      this._setLocalSelectedIndex(indexSelected);
    }
  }

  private _getLocalKey = () => {
    const { tag } = this.props;
    return `tabs-${tag}`;
  }

  private _getLocalSelectedIndex = () => {
    const value = localStorage.getItem(this._getLocalKey());
    return Number(value) || 0;
  }

  private _setLocalSelectedIndex = (index: number) => {
    return localStorage.setItem(this._getLocalKey(), String(index));
  }

  private _renderMoreAndMenu = () => {
    const { indexMenus, openMenu } = this.state;
    if (indexMenus.length === 0) {
      return null; // no more tab
    }
    return (
      <JuiPopperMenu
        Anchor={this._renderMore}
        placement="bottom-start"
        open={openMenu}
        value={MORE}
        key={MORE}
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

  private _renderMore = () => {
    return this._renderStyledTab({
      value: MORE,
      icon: <MoreHoriz />,
      onClick: this._showMenuList,
      style: STYLE,
      ref: this._moreRef,
    });
  }

  private _renderFinalTab = () => {
    const { indexTabs } = this.state;
    const tabs = indexTabs.map((item: number) =>
      this._renderStyledTab({ value: item, label: this._tabTitles[item] }),
    );
    const tabMoreAndMenu = this._renderMoreAndMenu();
    if (tabMoreAndMenu) {
      tabs.push(tabMoreAndMenu);
    }
    return tabs;
  }

  private _renderStyledTab = ({
    value,
    label,
    icon,
    onClick,
    style,
    ref,
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
        ref={ref}
      />
    );
  }

  private _renderAllTab = () => {
    const { children } = this.props;
    const tabs = Children.map(
      children,
      (child: ReactElement<JuiTabProps>, index: number) =>
        this._renderStyledTab({
          value: index,
          label: child.props.title,
          ref: this._tabRefs[index],
        }),
    );
    tabs.push(this._renderMore()); // add more tab
    return tabs;
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

    if (prevProps.width !== this.props.width) {
      this._measureContainerWidth();
      this._calculateIndexTabsAndIndexMenus();
    }
  }

  renderContainer = () => {
    const { children } = this.props;
    const { indexSelected, indexLazyLoadComponents } = this.state;
    return Children.map(
      children,
      (child: ReactElement<JuiTabProps>, index: number) => {
        let className = '';
        if (index === indexSelected) {
          className = 'show';
        }
        return (
          <StyledContainer key={index} className={className}>
            {indexLazyLoadComponents.includes(index) && child.props.children}
          </StyledContainer>
        );
      },
    );
  }

  renderTabs = () => {
    const { indexSelected, indexTabs, indexMenus } = this.state;
    // Notice:
    // 1. first execute render indexTabs & indexMenus length equal 0
    // 2. select menu list tab
    if (
      indexTabs.length > 0 &&
      indexMenus.length > 0 &&
      !indexTabs.includes(indexSelected)
    ) {
      return null;
    }
    return (
      <StyledTabs
        value={indexSelected}
        onChange={this._handleChangeTab}
        indicatorColor="primary"
        textColor="primary"
        classes={CLASSES.tabs}
        ref={this._containerRef}
      >
        {indexTabs.length === 0 && indexMenus.length === 0
          ? this._renderAllTab()
          : this._renderFinalTab()}
      </StyledTabs>
    );
  }

  render() {
    return (
      <StyledWrapper>
        {this.renderTabs()}
        {this.renderContainer()}
      </StyledWrapper>
    );
  }
}

export { JuiTabs };
