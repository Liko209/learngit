/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-01-08 19:02:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { ResponsiveInfo } from './Responsive';
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
  prevWidth: number = 0;

  state = {
    visual: {},
  };

  componentDidUpdate(prevProps: Props) {
    const prevTags = React.Children.map(
      prevProps.children,
      // @ts-ignore
      (child: React.ReactElement<any>) => child && child.type.tag,
    );
    const tags = React.Children.map(
      this.props.children,
      // @ts-ignore
      (child: React.ReactElement<any>) => child && child.type.tag,
    );
    if (prevTags.toString() !== tags.toString()) {
      this.initWidthAndResponsiveInfo();
      this.onResize(this.prevWidth);
    }
  }

  componentDidMount() {
    this.initWidthAndResponsiveInfo();
  }

  initWidthAndResponsiveInfo() {
    this.hasSortedResponsiveInfo = [...Object.values(this.responsiveInfo)].sort(
      (a, b) => Number(b.priority) - Number(a.priority),
    );
  }

  checkWidth = (diffWidth: number, minWidth?: number, defaultWidth?: number) =>
    (diffWidth > 0 ? defaultWidth || minWidth : minWidth) || 0

  contentWidth = (diffWidth: number) => {
    return this.hasSortedResponsiveInfo.reduce(
      (contentWidth: number, info: ResponsiveInfo) => {
        const { minWidth, defaultWidth } = info;
        const checkWidth = this.checkWidth(diffWidth, minWidth, defaultWidth);
        return contentWidth + checkWidth;
      },
      0,
    );
  }

  onResize = (width: number) => {
    const diffWidth = width - this.prevWidth;
    const contentWidth = this.contentWidth(diffWidth);
    this.prevWidth = width;
    let shouldUpdate = false;
    const visual = {};
    this.hasSortedResponsiveInfo.reduce((totalWidth, info) => {
      const { visualMode, minWidth, defaultWidth, tag } = info;
      let checkWidth = 0;
      visual[tag] = true;
      if (visualMode !== undefined && totalWidth >= width) {
        checkWidth = this.checkWidth(diffWidth, minWidth, defaultWidth);
        visual[tag] = false;
      }
      shouldUpdate = shouldUpdate || visual[tag] !== this.state.visual[tag];
      return totalWidth - checkWidth;
    },                                  contentWidth);
    if (shouldUpdate) {
      this.setState({
        visual,
      });
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
