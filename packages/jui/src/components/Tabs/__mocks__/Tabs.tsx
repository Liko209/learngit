/*
 * @Author: isaac.liu
 * @Date: 2019-07-03 15:47:56
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import { difference } from 'lodash';
import React, {
  PureComponent,
  ReactElement,
  createRef,
  RefObject,
  CSSProperties,
  MouseEvent,
  Children,
} from 'react';
import { StyledTabs } from '../StyledTabs';
import { StyledTab, StyledTabProps } from '../StyledTab';
import { StyledContainer } from '../StyledContainer';
import { StyledWrapper } from '../StyledWrapper';
import { JuiTabProps } from '../Tab';
import { JuiPopperMenu, AnchorProps } from '../../../pattern/PopperMenu';
import { JuiMenuList, JuiMenuItem } from '../../Menus';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { JuiIconography } from '../../../foundation/Iconography';

type States = {
  openMenu: boolean;
  indexSelected: number; // selected tab index
  indexTabs: number[]; // show tab index
  indexMenus: number[]; // menu tab index, when length > 0, then it has more tab
  indexLazyLoadComponents: number[]; // lazy load container component index
  remeasure: boolean;
  anchorEl: EventTarget & Element | null;
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
  private _tabRefs: RefObject<HTMLElement>[] = [];
  private _tabWidths: number[] = [];
  private _tabWidthsTotal: number = 0;
  private _automationIds: string[] = []; // automation ids, not include more tab
  // more tab
  private _moreRef: RefObject<HTMLDivElement>;
  private _moreWidth: number = 0;
  // right rail container
  private _containerRef: RefObject<any>;
  private _containerWidth: number = 0;
  private _containerStyle: React.CSSProperties = {};

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
    const { onChangeTab } = props;
    onChangeTab && onChangeTab(indexSelected);
    this.state = {
      indexSelected,
      indexLazyLoadComponents: [indexSelected],
      openMenu: false,
      indexTabs: [],
      indexMenus: [],
      remeasure: false,
      anchorEl: null,
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    const { children } = nextProps;
    const newTabTitles: (string | JSX.Element)[] = [];
    Children.map(children, (child: ReactElement<JuiTabProps>) => {
      return newTabTitles.push(child.props.title);
    });
    // force update after i18n ready
    if (difference(newTabTitles, this._tabTitles).length !== 0) {
      this._moreWidth = 0;
      this._tabTitles = newTabTitles;
      this.setState({ remeasure: true });
    }
  }

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

  private _handleMenuItemClick = (index: number, event: MouseEvent) => {
    this._setSelectedTabIndex(index);
  };

  private _setSelectedTabIndex = (indexSelected: number) => {
    let { indexLazyLoadComponents } = this.state;
    const { tag, onChangeTab } = this.props;
    if (!indexLazyLoadComponents.includes(indexSelected)) {
      indexLazyLoadComponents = indexLazyLoadComponents.concat(indexSelected);
    }
    this.setState({ indexSelected, indexLazyLoadComponents });
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
    const { indexMenus, openMenu, anchorEl } = this.state;
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
        classes={CLASSES.tab}
        style={style}
        ref={ref}
      />
    );
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
            style={Object.assign(this._containerStyle, {
              right: this._containerWidth,
            })}
          >
            {indexLazyLoadComponents.includes(index) && child.props.children}
          </StyledContainer>
        );
      },
    );
  };

  renderTabs = () => {
    const { position, forceFlex } = this.props;
    const { indexSelected, indexTabs } = this.state;
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
        classes={CLASSES.tabs}
        ref={this._containerRef}
      >
        {this._renderForShow()}
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
