/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-08 19:02:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent, ComponentType } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import Resizable from 're-resizable';
import { StyledPanel, StyledContent } from './StyledPanel';
import { StyledMain } from './StyledMain';

enum VISUAL_MODE {
  BOTH,
  MANUAL,
  AUTOMATIC,
}

type Enable = {
  right?: boolean;
  left?: boolean;
};

type ResponsiveInfo = {
  maxWidth?: number;
  minWidth?: number;
  defaultWidth?: number;
  visualMode?: VISUAL_MODE;
  priority?: number;
  tag: string;
};

type ResponsiveProps = ResponsiveInfo & {
  enable?: Enable;
  width?: number;
  visual?: boolean;
  TriggerButton?: React.ComponentType<any>;
  addResponsiveInfo?: (info: ResponsiveInfo) => {};
};

type ResponsiveState = {
  isShow: boolean;
  width: number;
  prevVisual: boolean;
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

  state = {
    isShow: false,
    width: this.localWidth,
    prevVisual: true,
  };

  componentDidMount() {
    const {
      maxWidth,
      minWidth,
      defaultWidth,
      visualMode,
      priority,
      tag,
      addResponsiveInfo,
    } = this.props;
    const responsiveInfo = {
      maxWidth,
      minWidth,
      defaultWidth,
      visualMode,
      priority,
      tag,
    };
    addResponsiveInfo && addResponsiveInfo(responsiveInfo);
  }

  componentWillReceiveProps(nextProps: ResponsiveProps) {
    const { visual: nextVisual } = nextProps;
    const { defaultWidth, visual } = this.props;
    if (defaultWidth && visual === false && nextVisual === true) {
      this.setState({
        width: defaultWidth,
        isShow: false,
      });
    }
  }

  get localWidth() {
    const { defaultWidth, tag } = this.props;
    const value = Number(localStorage.getItem(tag));
    return value || defaultWidth || 0;
  }

  set localWidth(value: number) {
    const { tag } = this.props;
    localStorage.setItem(tag, `${value}`);
  }

  get localShowState() {
    const { tag } = this.props;
    const value = localStorage.getItem(`${tag}-show-state`);
    return value ? (value === 'true' ? true : false) : true;
  }

  set localShowState(value: boolean) {
    const { tag } = this.props;
    localStorage.setItem(`${tag}-show-state`, `${value}`);
  }

  onResize = (width: number) => {
    this.localWidth = width;
    this.setState({
      width,
    });
  }

  handlerClickShowPanel = () => {
    this.setState({ isShow: true });
  }

  handlerClickHidePanel = () => {
    const { isShow } = this.state;
    if (isShow) {
      this.setState({ isShow: false });
    }
  }

  toggleShowPanel = () => {
    const { isShow } = this.state;
    const { visual } = this.props;
    if (this.isManualMode) {
      const localShowState = this.localShowState;
      if (isShow || visual !== false || !localShowState) {
        this.localShowState = !localShowState;
      }
    }
    this.setState({ isShow: !isShow });
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
    const {
      enable = {},
      children,
      minWidth,
      maxWidth,
      visual,
      priority,
    } = this.props;
    if (this.isManualMode && !this.localShowState) {
      return this.renderButton();
    }
    return (
      <>
        {(this.isManualMode || visual === false) && this.renderButton()}
        {visual ? (
          <Resizable
            enable={{ ...Responsive.DEFAULT_OPTIONS.enable, ...enable }}
            minWidth={minWidth}
            maxWidth={maxWidth}
            size={{
              width,
              height: 'auto',
            }}
            style={{
              flex: `0 ${priority} auto`,
            }}
          >
            {children}
            <ReactResizeDetector handleWidth={true} onResize={this.onResize} />
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

  renderMain = () => {
    const { children, minWidth } = this.props;
    return <StyledMain minWidth={Number(minWidth)}>{children}</StyledMain>;
  }

  render() {
    const { visualMode } = this.props;
    switch (true) {
      case visualMode === undefined:
        return this.renderMain();
      default:
        return this.renderMode();
    }
  }
}

const withResponsive = (
  WrappedComponent: ComponentType<any>,
  props: Partial<ResponsiveProps>,
) =>
  class ResponsiveHOC extends PureComponent<any> {
    static tag = `responsive(${WrappedComponent.displayName ||
      WrappedComponent.name})`;
    render() {
      return (
        <Responsive {...props} {...this.props} tag={ResponsiveHOC.tag}>
          <WrappedComponent {...this.props} />
        </Responsive>
      );
    }
  };

export default Responsive;

export { withResponsive, VISUAL_MODE, ResponsiveProps, ResponsiveInfo };
