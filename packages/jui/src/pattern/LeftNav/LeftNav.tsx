/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-8-23 10:29:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent, memo } from 'react';
import MuiList from '@material-ui/core/List/index';
import MuiListItem from '@material-ui/core/ListItem';
import MuiListItemText from '@material-ui/core/ListItemText';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import MuiDrawer, { DrawerProps } from '@material-ui/core/Drawer/index';
import styled from '../../foundation/styled-components';
import { RuiTooltip } from 'rcui/components/Tooltip';
import { fade } from '@material-ui/core/styles/colorManipulator';
import {
  height,
  grey,
  palette,
  spacing,
  width,
  typography,
} from '../../foundation/utils/styles';
/* eslint-disable */
const MaxWidth = 180;
const MinWidth = 64;
type LeftNavProps = {
  expand: boolean;
} & DrawerProps;
const CustomLeftNav: React.SFC<LeftNavProps> = memo(({ expand, ...props }) => {
  return <MuiDrawer {...props} />;
});

const Left = styled<LeftNavProps>(CustomLeftNav)`
  && {
    height: 100%; // safari compatibility
    -ms-overflow-style: -ms-autohiding-scrollbar;
  }
  .left-paper {
    background: ${palette('grey', '100')};
    position: relative;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    width: ${props => (props.expand ? MaxWidth : MinWidth)}px;
    justify-content: space-between;
    padding: ${spacing(8, 0, 6, 0)};
    box-sizing: border-box;
    transition: width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
    // this group btns will awake
    &:hover {
      .nav-icon {
        color: ${grey('500')}; // 500
      }
      .nav-text span {
        color: ${grey('900')};
      }
    }
    &::-webkit-scrollbar {
      width: 0 !important;
    }
  }
`;

const StyledListItem = styled(MuiListItem)`
  && {
    padding: 0;
    height: ${height(11)};
    outline: none;
    white-space: nowrap;
    color: ${grey('900')};
    /**
   * Workaround to resolve transition conflicts with react-sortable-hoc
   * Details at https://github.com/clauderic/react-sortable-hoc/issues/334
   */
    transition: transform 0s ease,
      background-color 150ms
        ${({ theme }) => theme.transitions.easing.easeInOut} 0ms;
  }
  &&:focus {
    background: ${grey('300')};
  }
  &&.selected {
    background: transparent;
  }
  // In order to make sure use tab switch nav
  &&.selected.left-item-focus {
    background: ${({ theme }) => theme.palette.action.active};
  }
  &&.left-item-focus {
    .left-link {
      span {
        color: ${grey('700')};
      }
      .nav-icon {
        color: ${grey('700')}; // 500
      }
    }
  }
  &&&:hover {
    background-color: ${({ theme, selected }) =>
      selected
        ? fade(grey('700')({ theme }), theme.opacity['1'] / 2)
        : fade(grey('700')({ theme }), theme.opacity['1'] / 2)};
    .nav-icon {
      color: ${grey('500')}; // 500
    }
  }
`;

const StyledListItemIcon = styled(MuiListItemIcon)`
  width: ${width(16)};
  min-width: unset;
  display: flex;
  justify-content: center;
  pointer-events: none;
  && {
    margin-right: 0;
  }
`;

const StyledListItemText = styled(MuiListItemText)`
  && {
    color: ${grey('500')}; // 500
    padding: 0;
    span {
      color: ${palette('accent', 'ash')}; // Aah
      ${typography('body1')}
    }
  }
`;

const ListLink = styled.a`
  position: relative;
  outline: none;
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  text-decoration: none;
  &&&:active {
    opacity: ${({ theme }) => 1 - 2 * theme.palette.action.hoverOpacity};
    .nav-icon,
    .nav-text span {
      color: ${palette('primary', 'main')}; // RC Blue
    }
  }
  &&.active {
    && .nav-icon,
    && .nav-text span {
      color: ${palette('primary', 'main')}; // RC Blue
    }
  }
  .nav-icon {
    color: ${palette('accent', 'ash')};
  }
  .nav-text span {
    color: ${grey('600')};
  }
`;

const UmiWrapper = styled.div<{ expand: boolean }>`
  display: flex;
  position: absolute;
  top: ${props => (!props.expand ? spacing(1) : '')};
  left: ${props => (!props.expand ? spacing(8) : '')};
  right: ${props => (props.expand ? spacing(4) : '')};
  transition: all 1s;
  .umi {
    color: #fff !important;
  }
`;

type JuiLeftNavProps = {
  expand: boolean;
  icons: {
    url: string | (() => string);
    Icon: React.ReactElement;
    IconSelected: React.ReactElement;
    title: string;
    umi?: JSX.Element;
  }[][];
  onRouteChange: Function;
  selectedPath: string;
};

class JuiLeftNav extends PureComponent<JuiLeftNavProps> {
  onRouteChangeHandlers: Map<
    string | (() => string),
    (event: React.MouseEvent<HTMLAnchorElement>) => void
  > = new Map();

  onRouteChange = (url: string | (() => string)) => {
    if (this.onRouteChangeHandlers.has(url)) {
      return this.onRouteChangeHandlers.get(url);
    }
    this.onRouteChangeHandlers.set(url, () => {
      const { onRouteChange } = this.props;
      const path = typeof url === 'string' ? url : url();
      onRouteChange(path);
    });
    return this.onRouteChangeHandlers.get(url);
  };

  renderNavItems = () => {
    const { icons, expand, selectedPath } = this.props;
    return icons.map((arr, idx) => {
      return (
        <MuiList component="nav" disablePadding key={idx}>
          {arr.map((item, index) => {
            const navUrl = item.url;
            const navPath = (typeof navUrl === 'string'
              ? navUrl
              : navUrl()
            ).split('/')[1];
            const selected =
              selectedPath.toLowerCase() === navPath.toLowerCase();
            const NavItem = (
              <StyledListItem
                button
                key={index}
                selected={selected}
                classes={{ selected: 'selected' }}
                disableRipple
                data-test-automation-id={navPath}
                focusVisibleClassName={'left-item-focus'}
                disableGutters
              >
                <ListLink
                  className={`left-link ${selected ? 'active' : ''}`}
                  onClick={this.onRouteChange(navUrl)}
                >
                  <StyledListItemIcon className={'nav-icon'}>
                    {selected ? item.IconSelected : item.Icon}
                  </StyledListItemIcon>
                  <StyledListItemText
                    primary={item.title}
                    className={'nav-text'}
                  />
                  <UmiWrapper expand={expand}>{item.umi}</UmiWrapper>
                </ListLink>
              </StyledListItem>
            );
            return expand ? (
              NavItem
            ) : (
              <RuiTooltip title={item.title} key={index} placement="right">
                {NavItem}
              </RuiTooltip>
            );
          })}
        </MuiList>
      );
    });
  };
  render() {
    const { expand } = this.props;
    return (
      <Left
        expand={expand}
        variant="permanent"
        classes={{ paper: 'left-paper' }}
        open={expand}
        data-test-automation-id="leftPanel"
      >
        {this.renderNavItems()}
      </Left>
    );
  }
}

export { JuiLeftNav, JuiLeftNavProps };
