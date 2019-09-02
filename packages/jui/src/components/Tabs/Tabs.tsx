/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-01-02 10:54:22
 * Copyright © RingCentral. All rights reserved.
 */
import { difference, isEqual } from 'lodash';
import React, {
  PureComponent,
  ReactElement,
  createRef,
  RefObject,
  CSSProperties,
  MouseEvent,
  Children,
} from 'react';
import { StyledTabs } from './StyledTabs';
import { StyledTab, StyledTabProps } from './StyledTab';
import { StyledContainer } from './StyledContainer';
import { StyledWrapper } from './StyledWrapper';
import { JuiTabProps } from './Tab';
import { JuiPopperMenu, AnchorProps } from '../../pattern/PopperMenu';
import { JuiMenuList, JuiMenuItem } from '../Menus';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { JuiIconography } from '../../foundation/Iconography';

type States = {
  openMenu: boolean;
  hideMenu: boolean;
  indexSelected: number; // selected tab index
  indexTabs: number[]; // show tab index
  indexMenus: number[]; // menu tab index, when length > 0, then it has more tab
  indexLazyLoadComponents: number[]; // lazy load container component index
  remeasure: boolean;
  anchorEl: EventTarget & Element | null;
  disableIndicatorTransition: boolean;
};

type Props = {
  width?: number; // resize
  tag?: string; // If there is a tag props, save it locally
  defaultActiveIndex: number;
  children: JSX.Element[];
  onChangeTab?: (index: number) => void;
  moreText?: string; // more tab support i18N
  position?: 'left' | 'center' | 'right';
  forceFlex?: boolean;
};

const MORE = 10000; // more tab mui auto add child index

const STYLE: CSSProperties = {
  position: 'absolute',
  right: 0,
};

const MoreIcon = ({
  title,
  tooltipForceHide,
}: {
  title?: string;
  tooltipForceHide?: boolean;
}) => (
  <RuiTooltip title={title} tooltipForceHide={tooltipForceHide}>
    <JuiIconography>more_horiz</JuiIconography>
  </RuiTooltip>
);

class JuiTabs extends PureComponent<Props, States> {
  // not include more tab
  private _tabTitles: (string | JSX.Element)[] = [];
  private _tabRefs: RefObject<HTMLDivElement>[] = [];
  private _tabWidths: number[] = [];
  private _tabWidthsTotal: number = 0;
  private _automationIds: string[] = []; // automation ids, not include more tab
  // more tab
  private _moreRef: RefObject<HTMLDivElement>;
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
        this._automationIds.push(child.props.automationId || ''); // add automation id
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
      hideMenu: false,
      indexTabs: [],
      indexMenus: [],
      remeasure: false,
      anchorEl: null,
      disableIndicatorTransition: true,
    };
  }

  componentDidMount() {
    this._measureMoreWidth();
    this._measureTabWidths();
    this._measureContainerWidth();
    this._calculateIndexTabsAndIndexMenus();
  }

  componentWillReceiveProps(nextProps: Props) {
    const { children } = nextProps;
    const newTabTitles: (string | JSX.Element)[] = [];
    Children.map(children, (child: ReactElement<JuiTabProps>) =>
      newTabTitles.push(child.props.title),
    );
    // force update after i18n ready
    if (difference(newTabTitles, this._tabTitles).length !== 0) {
      this._moreWidth = 0;
      this._tabTitles = newTabTitles;
      this.setState({ remeasure: true });
    }

    if (nextProps.width === 0) {
      this.setState({ hideMenu: true, openMenu: false });
    } else {
      this.setState({ hideMenu: false });
    }
  }
  /* eslint-disable */
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
  };

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
  };

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
    if (
      isEqual(this.state.indexMenus, indexMenus) &&
      isEqual(this.state.indexTabs, indexTabs)
    ) {
      return;
    }
    this.setState({
      indexMenus,
      indexTabs,
    });
  };

  private _handleChangeTab = (event: MouseEvent, indexSelected: number) => {
    if (indexSelected === MORE) {
      return;
    }
    this._setSelectedTabIndex(indexSelected);
  };

  private _showMenuList = (evt: MouseEvent) => {
    const { currentTarget } = evt;
    this.setState(state => ({
      anchorEl: currentTarget,
      openMenu: !state.openMenu,
    }));
  };

  private _hideMenuList = () => {
    this.setState({
      openMenu: false,
    });
  };

  private _handleMenuItemClick = (index: number) => {
    this._setSelectedTabIndex(index);
  };

  private _setSelectedTabIndex = (indexSelected: number) => {
    let { indexLazyLoadComponents } = this.state;
    const { tag, onChangeTab } = this.props;
    if (!indexLazyLoadComponents.includes(indexSelected)) {
      indexLazyLoadComponents = indexLazyLoadComponents.concat(indexSelected);
    }
    this.setState({
      indexSelected,
      indexLazyLoadComponents,
      disableIndicatorTransition: false,
    });
    if (tag) {
      this._setLocalSelectedIndex(indexSelected);
    }
    onChangeTab && onChangeTab(indexSelected);
  };

  private _getLocalKey = () => {
    const { tag } = this.props;
    return `tabs-${tag}`;
  };

  private _getLocalSelectedIndex = () => {
    const value = localStorage.getItem(this._getLocalKey());
    return Number(value) || 0;
  };

  private _setLocalSelectedIndex = (index: number) => {
    return localStorage.setItem(this._getLocalKey(), String(index));
  };

  private _renderMoreAndMenu = () => {
    const { indexMenus, openMenu, hideMenu, anchorEl } = this.state;
    if (indexMenus.length === 0 || hideMenu) {
      return null; // no more tab
    }
    return (
      <JuiPopperMenu
        Anchor={hideMenu ? () => null : this._renderMore}
        placement="bottom-start"
        open={openMenu}
        value={MORE}
        key={MORE}
        onClose={this._hideMenuList}
        anchorEl={anchorEl}
      >
        <JuiMenuList onClick={this._hideMenuList}>
          {indexMenus.map((item: number) => {
            return (
              <JuiMenuItem
                data-test-automation-id={this._automationIds[item]}
                key={item}
                onClick={this._handleMenuItemClick.bind(this, item)}
              >
                {this._tabTitles[item]}
              </JuiMenuItem>
            );
          })}
        </JuiMenuList>
      </JuiPopperMenu>
    );
  };

  private _renderMore = ({ tooltipForceHide }: AnchorProps) => {
    const { tag, moreText } = this.props;
    return this._renderStyledTab({
      value: MORE,
      icon: <MoreIcon title={moreText} tooltipForceHide={tooltipForceHide} />,
      onClick: this._showMenuList,
      style: STYLE,
      ref: this._moreRef,
      automationId: `${tag}-more`,
    });
  };

  private _renderForShow = () => {
    const { indexTabs } = this.state;
    const tabs = indexTabs.map((item: number) =>
      this._renderStyledTab({
        value: item,
        label: this._tabTitles[item],
        automationId: this._automationIds[item],
      }),
    );
    const tabMoreAndMenu = this._renderMoreAndMenu();
    if (tabMoreAndMenu) {
      tabs.push(tabMoreAndMenu);
    }
    return tabs;
  };

  private _renderStyledTab = ({
    value,
    label,
    icon,
    onClick,
    style,
    ref,
    automationId,
  }: StyledTabProps) => {
    return (
      <StyledTab
        data-test-automation-id={automationId}
        value={value}
        key={value}
        label={label}
        icon={icon}
        onClick={onClick}
        style={style}
        ref={ref}
      />
    );
  };

  private _renderForMeasure = () => {
    const { children } = this.props;
    const tabs = Children.map(
      children,
      (child: ReactElement<JuiTabProps>, index: number) =>
        this._renderStyledTab({
          value: index,
          label: child.props.title,
          ref: this._tabRefs[index],
          automationId: this._automationIds[index],
        }),
    );
    tabs.push(this._renderMore({ tooltipForceHide: false })); // add more tab
    return tabs;
  };

  componentDidUpdate(prevProps: Props, prevState: States) {
    const { indexTabs, indexSelected, remeasure } = this.state;
    const { width } = this.props;

    // selected menu list tab index
    if (indexTabs.length > 0 && !indexTabs.includes(indexSelected)) {
      this._calculateIndexTabsAndIndexMenus();
    }

    // resize width
    if (prevProps.width !== width) {
      if (this._moreWidth === 0) {
        this.setState({ remeasure: true });
      } else {
        // this._measureMoreWidth();
        // this._measureTabWidths(); // Notes: menu list tab no ref
        // Notes: only measure container width
        this._measureContainerWidth();
        this._calculateIndexTabsAndIndexMenus();
      }
    }

    // remeasure width
    if (remeasure && this._moreWidth === 0) {
      this._measureMoreWidth();
      this._measureTabWidths();
      this._measureContainerWidth();
      this._calculateIndexTabsAndIndexMenus();
      this.setState({ remeasure: false });
    }
  }
  private _measureMoreWidth = () => {
    const domMore = this._moreRef.current;
    if (domMore) {
      this._moreWidth = domMore.getBoundingClientRect().width;
    }
    // console.log('tabs', `_moreWidth: ${this._moreWidth}`);
  };

  renderContainers = () => {
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
          <StyledContainer
            key={index}
            className={className}
            style={{ right: 10 * this._containerWidth }}
          >
            {indexLazyLoadComponents.includes(index) && child.props.children}
          </StyledContainer>
        );
      },
    );
  };

  renderTabs = () => {
    const {
      indexTabs,
      indexSelected,
      disableIndicatorTransition,
    } = this.state;

    const { position, forceFlex } = this.props;

    // Notice:
    // 1. when first execute render, then indexTabs length equal 0
    // 2. when right rail hide, then indexTabs length equal 0
    // 3. when select menu list tab, then selected tab index not mounted yet
    let index: number | boolean = indexSelected;
    if (indexTabs.length === 0 || !indexTabs.includes(index)) {
      index = false; // It don't want any selected tab index
    }
    let measure = false;
    if (this._moreWidth === 0) {
      measure = true; // The width needs to be remeasured
    }

    return (
      <StyledTabs
        forceFlex={forceFlex}
        position={position}
        value={index}
        onChange={this._handleChangeTab}
        indicatorColor="primary"
        textColor="primary"
        ref={this._containerRef}
        disableIndicatorTransition={disableIndicatorTransition}
      >
        {measure ? this._renderForMeasure() : this._renderForShow()}
      </StyledTabs>
    );
  };

  render() {
    return (
      <StyledWrapper>
        {this.renderTabs()}
        {this.renderContainers()}
      </StyledWrapper>
    );
  }
}

export { JuiTabs };
