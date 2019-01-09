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
  prevWidth: number = 1;
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
    const visual = {};
    this.hasSortedResponsiveInfo.reduce((totalWidth, info) => {
      const { visualMode, minWidth, tag } = info;
      visual[tag] = true;
      if (visualMode !== undefined && totalWidth >= width) {
        visual[tag] = false;
        return totalWidth - Number(minWidth);
      }
      return totalWidth;
    },                                  this.contentWidth);
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

  smallHandler = (width: number, diffWidth: number) => {
    const canChangeWidth = this.hasSortedResponsiveInfo.some(
      (info: ResponsiveProps) => {
        const checkWidth = Number(info.defaultWidth) || Number(info.minWidth);
        const infoDiffWidth = Number(info.width) - checkWidth;
        if (infoDiffWidth > 0) {
          const panelWidth = Number(info.width) - diffWidth;
          debugger;
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
    const diffWidth = this.prevWidth - width;
    const multiple = Math.abs(diffWidth) / this.prevWidth;
    this.prevWidth = width;
    if (multiple > 0.5) {
      this.init(width);
      return;
    }
    if (diffWidth < 0) {
      this.largeHandler(width);
    } else {
      this.smallHandler(width, diffWidth);
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
