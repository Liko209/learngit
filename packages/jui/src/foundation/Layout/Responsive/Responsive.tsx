/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-08 19:02:43
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent, ComponentType } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import Resizable, { ResizableProps } from 're-resizable';
import styled from '../../styled-components';
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
  prevVisual?: boolean;
};

const StyledResizable = styled<ResizableProps & any>(Resizable)`
  overflow: hidden;
  top: 0;
  bottom: 0;
  left: ${({ position }) => (position === 'left' ? 0 : 'auto')};
  right: ${({ position }) => (position === 'right' ? 0 : 'auto')};
  z-index: ${({ theme, absolute }) =>
    absolute ? theme.zIndex.appBar + 1 : 'auto'};
  display: ${({ show }) => (show ? 'flex' : 'none')};
  flex: ${({ priority }) => `0 ${priority} auto`};
`;

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
    prevVisual: this.props.visual,
  };

  enableResizable = {
    ...Responsive.DEFAULT_OPTIONS.enable,
    ...this.props.enable,
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

  static getDerivedStateFromProps(
    nextProps: ResponsiveProps,
    prevState: ResponsiveState,
  ) {
    const { visual, defaultWidth } = nextProps;
    const { prevVisual } = prevState;
    if (visual === false && prevVisual !== visual) {
      return {
        prevVisual: visual,
        isShow: false,
        width: 0,
      };
    }
    if (defaultWidth && prevVisual === false && visual === true) {
      return {
        width: defaultWidth,
        prevVisual: visual,
        isShow: false,
      };
    }

    return null;
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
    if (width) {
      this.localWidth = width;
      this.setState({
        width,
      });
    }
  }

  handlerClickShowPanel = () => {
    const { minWidth } = this.props;
    this.setState({ isShow: true, width: Number(minWidth) });
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
    if (visual === undefined) {
      return null;
    }
    return (
      <>
        {(this.isManualMode || !visual) && this.renderButton()}
        <StyledResizable
          enable={
            visual ? this.enableResizable : Responsive.DEFAULT_OPTIONS.enable
          }
          minWidth={visual || isShow ? minWidth : 0}
          maxWidth={maxWidth}
          size={{
            width,
            height: '100%',
          }}
          style={{
            position: !visual ? 'absolute' : 'relative',
          }}
          show={!this.isManualMode || this.localShowState}
          priority={priority}
          absolute={!visual}
          position={enable.right ? 'left' : 'right'}
        >
          {children}
          {visual && (
            <ReactResizeDetector handleWidth={true} onResize={this.onResize} />
          )}
        </StyledResizable>
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
