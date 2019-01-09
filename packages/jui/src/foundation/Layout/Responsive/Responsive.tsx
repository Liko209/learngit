/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-08 19:02:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent, ComponentType } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import Resizable from 're-resizable';
import { StyledPanel, StyledContent } from './StyledPanel';
// import { StyledButton } from './StyledButton';
import { ResponsiveContext } from './responsiveContext';
import Optimizer from './optimizer';

enum VISUAL_MODE {
  BOTH,
  MANUAL,
  AUTOMATIC,
}

type Enable = {
  right?: boolean;
  left?: boolean;
};

type ResponsiveProps = {
  maxWidth?: number;
  minWidth?: number;
  defaultWidth?: number;
  visualMode?: VISUAL_MODE;
  enable?: Enable;
  width?: number;
  tag: string;
  priority?: number;
  visual?: boolean;
  TriggerButton?: React.ComponentType<any>;
  responsiveInfo: object;
};

type ResponsiveState = {
  width: number;
  lastWidth: number;
  localChange: boolean;
  isShow: boolean;
};

class Responsive extends PureComponent<ResponsiveProps, ResponsiveState> {
  static DEFAULT_OPTIONS = {
    enable: {
      top: false,
      right: false,
      bottom: false,
      left: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false,
    },
  };

  static defaultProps = {
    enable: {
      right: false,
      left: false,
    },
    priority: 0,
  };

  optimizer = new Optimizer();

  state = {
    lastWidth: this.localWidth,
    width: this.localWidth,
    localChange: false,
    isShow: false,
  };

  static getDerivedStateFromProps(
    props: ResponsiveProps,
    state: ResponsiveState,
  ) {
    if (state.localChange) {
      return {
        localChange: false,
      };
    }
    const { width } = props;
    const { lastWidth } = state;
    const newState = {} as ResponsiveState;
    if (width && lastWidth !== width) {
      newState.width = width;
      newState.lastWidth = width;
    }
    if (Object.keys(newState).length) {
      return newState;
    }
    return null;
  }

  componentDidMount() {
    const {
      maxWidth,
      minWidth,
      defaultWidth,
      visualMode,
      priority,
      tag,
      responsiveInfo,
    } = this.props;
    responsiveInfo[tag] = {
      maxWidth,
      minWidth,
      defaultWidth,
      visualMode,
      priority,
      tag,
    };
    this.optimizer = new Optimizer();
    this.optimizer.addResizeListener(this.handlerClickHidePanel);
  }

  componentWillUnmount() {
    this.optimizer.removeResizeListener();
    delete this.optimizer;
  }

  get localWidth() {
    const { defaultWidth, tag, width } = this.props;
    const value = Number(localStorage.getItem(tag));
    return width || value || defaultWidth || 0;
  }

  setLocalWidth = (value: number) => {
    const { tag } = this.props;
    return localStorage.setItem(tag, `${value}`);
  }

  get localShowState() {
    const { tag } = this.props;
    const value = localStorage.getItem(`${tag}-show-state`);
    return value ? (value === 'true' ? true : false) : undefined;
  }

  setLocalShowState = (value: boolean) => {
    const { tag } = this.props;
    return localStorage.setItem(`${tag}-show-state`, `${value}`);
  }

  onResize = (width: number) => {
    this.setLocalWidth(width);
    const { tag, responsiveInfo } = this.props;
    const info = responsiveInfo[tag];
    info.width = width;
    this.setState({
      width,
      localChange: true,
    });
  }

  handlerClickShowPanel = () => {
    this.setState({ isShow: true, localChange: true });
  }

  handlerClickHidePanel = () => {
    const { isShow } = this.state;
    if (isShow) {
      this.setState({ isShow: false, localChange: true });
    }
  }

  toggleShowPanel = () => {
    const { isShow } = this.state;
    const { visual } = this.props;
    if (this.isManualMode) {
      const localShowState = this.localShowState;
      if (isShow || visual !== false || !localShowState) {
        this.setLocalShowState(!localShowState);
      }
    }
    this.setState({ isShow: !isShow, localChange: true });
  }

  renderButton = () => {
    const { TriggerButton, visual } = this.props;
    if (TriggerButton) {
      const { isShow } = this.state;
      let isOpen = visual !== false || isShow;
      if (this.isManualMode) {
        const localShowState = this.localShowState;
        isOpen = !!localShowState && isOpen;
      }
      return <TriggerButton onClick={this.toggleShowPanel} isOpen={isOpen} />;
    }
    return null;
  }

  get isManualMode() {
    const { visualMode } = this.props;
    return visualMode === VISUAL_MODE.MANUAL || visualMode === VISUAL_MODE.BOTH;
  }

  renderMode = () => {
    const { isShow, width } = this.state;
    const { enable = {}, children, minWidth, maxWidth, visual } = this.props;
    if (this.isManualMode && !this.localShowState) {
      return this.renderButton();
    }
    return (
      <>
        {(this.isManualMode || visual === false) && this.renderButton()}
        {visual !== false ? (
          <Resizable
            enable={{ ...Responsive.DEFAULT_OPTIONS.enable, ...enable }}
            minWidth={minWidth}
            maxWidth={maxWidth}
            size={{
              width,
              height: 'auto',
            }}
            style={{
              flex: maxWidth ? '0 1 auto' : 1,
            }}
          >
            {children}
            <ReactResizeDetector
              handleWidth={true}
              onResize={this.onResize}
              refreshMode="debounce"
              refreshRate={50}
            />
          </Resizable>
        ) : (
          <StyledPanel position={enable.left ? 'right' : 'left'}>
            <StyledContent width={isShow ? Number(minWidth) : 0}>
              {children}
            </StyledContent>
          </StyledPanel>
        )}
      </>
    );
  }

  render() {
    return this.renderMode();
  }
}

const withResponsive = (
  WrappedComponent: ComponentType<any>,
  props?: Partial<ResponsiveProps>,
) =>
  class ResponsiveHOC extends PureComponent<any> {
    static tag = `responsive(${WrappedComponent.displayName ||
      WrappedComponent.name})`;
    render() {
      return (
        <ResponsiveContext.Consumer>
          {({ responsiveInfo }) => (
            <Responsive
              {...props}
              {...this.props}
              tag={ResponsiveHOC.tag}
              responsiveInfo={responsiveInfo}
            >
              <WrappedComponent {...this.props} />
            </Responsive>
          )}
        </ResponsiveContext.Consumer>
      );
    }
  };

export default Responsive;

export { withResponsive, VISUAL_MODE, ResponsiveProps };
