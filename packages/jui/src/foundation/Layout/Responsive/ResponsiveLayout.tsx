/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-08 19:02:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { ResponsiveInfo, VISUAL_MODE } from './Responsive';
import { StyledWrapper } from './StyledWrapper';

type Props = {
  children: (JSX.Element | null)[];
};

type State = {
  visual: { [key: string]: boolean };
};

class JuiResponsiveLayout extends PureComponent<Props, State> {
  responsiveInfo: { [key: string]: ResponsiveInfo } = {};
  hasSortedResponsiveInfo: ResponsiveInfo[] = [];
  prevWidth: number = 1;
  visualWidth: number = 0;
  contentWidth: number = 0;

  state = {
    width: {},
    visual: {},
  };

  componentDidUpdate(props: Props) {
    if (
      props.children !== this.props.children &&
      this.prevWidth !== 1 &&
      props.children.length !== this.props.children.length
    ) {
      this.initWidthAndResponsiveInfo();
      this.init(this.prevWidth);
    }
  }

  componentDidMount() {
    this.initWidthAndResponsiveInfo();
  }

  initWidthAndResponsiveInfo() {
    this.contentWidth = 0;
    this.visualWidth = 0;
    this.hasSortedResponsiveInfo = [...Object.values(this.responsiveInfo)].sort(
      (a, b) => Number(b.priority) - Number(a.priority),
    );
    this.hasSortedResponsiveInfo.forEach((info: ResponsiveInfo) => {
      const { defaultWidth, minWidth, visualMode } = info;
      const checkWidth = Number(defaultWidth) || Number(minWidth);
      if (visualMode === undefined) {
        this.visualWidth += checkWidth;
      }
      this.contentWidth += Number(minWidth);
    });
  }

  init = (width: number) => {
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
          });
          arr.splice(1);
        }
        return calculateWidth;
      },      0);
  }

  smallHandler = (width: number) => {
    if (width < this.contentWidth) {
      const { visual } = this.state;
      this.hasSortedResponsiveInfo.some((info: ResponsiveInfo) => {
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
      this.smallHandler(width);
    }
  }

  addResponsiveInfo = (Info: ResponsiveInfo) => {
    const { tag } = Info;
    this.responsiveInfo[tag] = Info;
  }

  render() {
    const { children } = this.props;
    const { visual } = this.state;
    return (
      <StyledWrapper>
        {React.Children.map(children, (child: React.ReactElement<any>) => {
          return (
            child &&
            React.createElement(child.type, {
              ...child.props,
              // @ts-ignore
              visual: visual[child.type.tag],
              addResponsiveInfo: this.addResponsiveInfo,
            })
          );
        })}
        <ReactResizeDetector handleWidth={true} onResize={this.onResize} />
      </StyledWrapper>
    );
  }
}

export { JuiResponsiveLayout };
