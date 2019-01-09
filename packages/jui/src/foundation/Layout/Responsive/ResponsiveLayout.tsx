/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-08 19:02:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { ResponsiveContext } from './responsiveContext';
import { ResponsiveProps, VISUAL_MODE } from './Responsive';
import { StyledWrapper } from './StyledWrapper';

type Props = {
  children: (JSX.Element | null)[];
};

type State = {
  width: { [key: string]: number };
  visual: { [key: string]: boolean };
};

class JuiResponsiveLayout extends PureComponent<Props, State> {
  responsiveInfo: { [key: string]: ResponsiveProps } = {};
  hasSortedResponsiveInfo: ResponsiveProps[] = [];
  prevWidth: number = Number.MAX_SAFE_INTEGER;
  visualWidth: number = 0;
  contentWidth: number = 0;
  hasInit: boolean = false;

  state = {
    width: {},
    visual: {},
  };

  componentDidMount() {
    this.hasSortedResponsiveInfo = [...Object.values(this.responsiveInfo)].sort(
      (a, b) => Number(b.priority) - Number(a.priority),
    );
    this.hasSortedResponsiveInfo.forEach((info: ResponsiveProps) => {
      const { defaultWidth, minWidth, visualMode } = info;
      const checkWidth = Number(defaultWidth) || Number(minWidth);
      if (visualMode === undefined) {
        this.visualWidth += checkWidth;
      }
      this.contentWidth += Number(minWidth);
    });
  }

  init = (width: number) => {
    this.hasInit = true;
    if (this.contentWidth < width) {
      return;
    }
    const visual = {};
    this.hasSortedResponsiveInfo.some((info: ResponsiveProps) => {
      const { visualMode, minWidth, tag } = info;
      if (visualMode !== undefined) {
        visual[tag] = false;
        if (this.contentWidth - Number(minWidth) < width) {
          return true;
        }
      }
      return false;
    });
    this.setState({
      visual,
    });
  }

  largeHandler = (width: number) => {
    const { visual } = this.state;
    [...this.hasSortedResponsiveInfo]
      .reverse()
      .reduce((totalWidth, info, i, arr) => {
        const { visualMode, tag, defaultWidth, minWidth } = info;
        const checkWidth = Number(defaultWidth) || Number(minWidth);
        const calculateWidth =
          visualMode === undefined
            ? totalWidth
            : totalWidth + Number(checkWidth);
        if (
          visual[tag] === false &&
          width > calculateWidth + this.visualWidth &&
          (visualMode === VISUAL_MODE.AUTOMATIC ||
            visualMode === VISUAL_MODE.BOTH)
        ) {
          this.setState({
            visual: {
              ...this.state.visual,
              [tag]: true,
            },
            width: {
              ...this.state.width,
              [tag]: checkWidth,
            },
          });
          arr.splice(1);
        }
        return calculateWidth;
      },      0);
  }

  smallHandler = (width: number) => {
    const diffWidth = this.prevWidth - width;
    const canChangeWidth = this.hasSortedResponsiveInfo.some(
      (info: ResponsiveProps) => {
        const checkWidth = Number(info.defaultWidth) || Number(info.minWidth);
        const infoDiffWidth = Number(info.width) - checkWidth;
        if (infoDiffWidth > 0) {
          const panelWidth = Number(info.width) - diffWidth;
          this.setState({
            width: {
              ...this.state.width,
              [info.tag]: panelWidth > checkWidth ? panelWidth : checkWidth,
            },
          });
          return true;
        }
        return false;
      },
    );
    if (!canChangeWidth) {
      const { visual } = this.state;
      this.hasSortedResponsiveInfo.some((info: ResponsiveProps) => {
        if (info.visualMode !== undefined && visual[info.tag] !== false) {
          this.setState({
            visual: {
              ...this.state.visual,
              [info.tag]: false,
            },
          });
          return true;
        }
        return false;
      });
    }
  }

  onResize = (width: number) => {
    if (!this.hasInit) {
      this.init(width);
      return;
    }
    const diffWidth = this.prevWidth - width;
    this.prevWidth = width;
    if (diffWidth < 0) {
      this.largeHandler(width);
    } else {
      this.smallHandler(width);
    }
  }

  render() {
    const { children } = this.props;
    const { width, visual } = this.state;
    return (
      <StyledWrapper>
        <ResponsiveContext.Provider
          value={{ responsiveInfo: this.responsiveInfo }}
        >
          {React.Children.map(children, (child: React.ReactElement<any>) => {
            return (
              child &&
              React.createElement(child.type, {
                ...child.props,
                // @ts-ignore
                width: width[child.type.tag],
                // @ts-ignore
                visual: visual[child.type.tag],
              })
            );
          })}
        </ResponsiveContext.Provider>
        <ReactResizeDetector
          handleWidth={true}
          onResize={this.onResize}
          refreshMode="debounce"
          refreshRate={150}
        />
      </StyledWrapper>
    );
  }
}

export { JuiResponsiveLayout };
