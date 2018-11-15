/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-14 14:00:12
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent } from 'react';
import styled from '../../styled-components';
import { addResizeListener, removeResizeListener } from './optimizer';
import { cloneDeep } from 'lodash';

const MAIN_MIN_WIDTH = 400;
const SIDEBAR_DEFAULT_WIDTH = 268;
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 360;

type Props = {
  tag: string; // This tag is used to record widths of various types
  children: JSX.Element[];
  mainPanelIndex: number;
};

type Panels = {
  width: number;
  localWidth?: number;
  minWidth: number;
  maxWidth?: number;
};

type States = {
  panels: Panels[];
};

const StyledWrapper = styled('div')`
  display: flex;
  height: 100%;
  width: 100%;
`;

type PropsSidebarPanel = {
  width: number;
};

const StyledSidebarPanel = styled('div').attrs({ className: 'panel-sidebar' })`
  height: 100%;
  flex-basis: ${(props: PropsSidebarPanel) => `${props.width}px`};
  display: ${(props: PropsSidebarPanel) =>
    props.width > 0 ? 'inline-block' : 'none'};
`;

const StyledMainPanel = styled('div').attrs({ className: 'panel-main' })`
  height: 100%;
  flex: 1;
  /* min-width: ${MAIN_MIN_WIDTH}px; */
  border: 1px solid red;
`;

class JuiColumnResponse extends PureComponent<Props, States> {
  private wrapperRef: React.RefObject<any>;
  private mainRef: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    this.state = { panels: this.getPanelsData() };
    this.wrapperRef = React.createRef();
    this.mainRef = React.createRef();

    this.onResize = this.onResize.bind(this);
  }

  getPanelsData = () => {
    const { children, mainPanelIndex } = this.props;
    if (mainPanelIndex > React.Children.count(children) - 1) {
      throw new Error('Main container panel index overflow!');
    }
    return React.Children.map(children, (child: JSX.Element, index: number) => {
      if (index === mainPanelIndex) {
        return {
          width: 0,
          minWidth: MAIN_MIN_WIDTH,
        };
      }

      const localWidth = this.getLocalWidth(index);
      return {
        localWidth,
        width: localWidth, // current width
        minWidth: SIDEBAR_MIN_WIDTH,
        maxWidth: SIDEBAR_MAX_WIDTH,
      };
    });
  }

  getLocalKey = (index: number) => {
    const { tag } = this.props;
    return `responsive-${tag}-${index}`;
  }

  getLocalWidth = (index: number) => {
    const value = localStorage.getItem(this.getLocalKey(index));
    return Number(value) || SIDEBAR_DEFAULT_WIDTH;
  }

  setLocalWidth = (index: number, value: number) => {
    return localStorage.setItem(this.getLocalKey(index), String(value));
  }

  componentDidMount() {
    addResizeListener(this.onResize);
    this.onResize();
  }

  componentWillUnmount() {
    removeResizeListener();
  }

  onResize() {
    const { mainPanelIndex } = this.props;
    const { panels } = this.state;

    const wrapperWidth = this.wrapperRef.current.getBoundingClientRect().width;
    const mainWidth = this.mainRef.current.getBoundingClientRect().width;

    const clonePanels = cloneDeep(panels);
    const count = clonePanels.length;
    const mainPanel = clonePanels[mainPanelIndex];
    mainPanel.width = mainWidth;

    if (mainPanel.width <= MAIN_MIN_WIDTH) {
      mainPanel.width = MAIN_MIN_WIDTH; // keep main panel minimum
      for (let i = count - 1; i >= 0; i--) {
        if (i === mainPanelIndex) {
          continue;
        }
        const panel = clonePanels[i]; // last panel
        const sum = this.getSumExceptOneself(clonePanels, i);
        panel.width = wrapperWidth - sum; // 1. shrink panel
        if (panel.width < panel.minWidth) {
          panel.width = 0; // 2. hide panel
          const sum = this.getSumExceptOneself(clonePanels, mainPanelIndex);
          // note: main panel width is changed
          mainPanel.width = wrapperWidth - sum; // stretch main panel
        }
        // note: ensure value is correct
        if (mainPanel.width <= MAIN_MIN_WIDTH) {
          mainPanel.width = MAIN_MIN_WIDTH; // keep main panel minimum
        }
      }
    } else {
      for (let j = 0; j < count; j++) {
        if (j === mainPanelIndex) {
          const sum = this.getSumExceptOneself(clonePanels, j);
          mainPanel.width = wrapperWidth - sum;
          continue;
        }
        const panel = clonePanels[j]; // first panel
        if (mainPanel.width >= MAIN_MIN_WIDTH + panel.minWidth) {
          if (panel.width < panel.minWidth) {
            panel.width = panel.minWidth; // 1. show panel
            const sum = this.getSumExceptOneself(clonePanels, j);
            mainPanel.width = wrapperWidth - sum;
          }
        }
        if (panel.width >= panel.minWidth) {
          if (panel.width < panel.localWidth!) {
            mainPanel.width = MAIN_MIN_WIDTH;
            const sum = this.getSumExceptOneself(clonePanels, j);
            // note: current panel width is changed
            panel.width = wrapperWidth - sum; // 2. stretch panel
          }
          // note: ensure value is correct
          if (panel.width > panel.localWidth!) {
            panel.width = panel.localWidth!; // 3. original panel
            const sum = this.getSumExceptOneself(clonePanels, j);
            mainPanel.width = wrapperWidth - sum;
          }
        }
      }
    }

    this.setState({ panels: clonePanels });
  }

  getSumExceptOneself(panels: Panels[], index: number) {
    const count = panels.length;
    let sum = 0;
    for (let i = count - 1; i >= 0; i--) {
      if (i === index) {
        continue;
      } else {
        sum += panels[i].width!;
      }
    }
    return sum;
  }

  render() {
    const { children, mainPanelIndex } = this.props;
    const { panels } = this.state;
    return (
      <StyledWrapper ref={this.wrapperRef}>
        {React.Children.map(children, (child: JSX.Element, index: number) => {
          if (index === mainPanelIndex) {
            return (
              <StyledMainPanel ref={this.mainRef}>
                {child}
                {panels[index].width!}
              </StyledMainPanel>
            );
          }
          return (
            <StyledSidebarPanel width={panels[index].width!}>
              {child}
              {panels[index].width!}
            </StyledSidebarPanel>
          );
        })}
      </StyledWrapper>
    );
  }
}

export { JuiColumnResponse };

// import { JuiColumnResponse } from 'jui/foundation/Layout/Response/ColumnResponse';

/* <JuiColumnResponse mainPanelIndex={1}>
  <div>1</div>
  <div>2</div>
  <div>3</div>
</JuiColumnResponse>; */
