/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-14 14:00:12
 * Copyright © RingCentral. All rights reserved.
 */

import React, { PureComponent, MouseEvent as ReactMouseEvent } from 'react';
import styled from '../../styled-components';
import { addResizeListener, removeResizeListener } from './optimizer';
import { cloneDeep } from 'lodash';

import JuiHorizonResizer from './HorizonResizer';
import JuiHorizonButton from './HorizonButton';

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
  forceShow?: boolean;
};

type States = {
  panels: Panels[];
  currentElement: Element | null; // Resizer(vertical line)
  currentIndex: number;
};

const StyledWrapper = styled('div')`
  display: flex;
  height: 100%;
  width: 100%;
  position: relative;
`;

type PropsSidebarPanel = {
  width: number;
  forceShow: boolean;
  forcePosition: 'left' | 'right';
  forceWidth: number;
};

const StyledSidebarPanel = styled('div')`
  height: 100%;
  flex-basis: ${(props: PropsSidebarPanel) => `${props.width}px`};
  display: ${(props: PropsSidebarPanel) =>
    props.width > 0 ? 'inline-block' : 'none'};
  background-color: ${({ theme }) => theme.palette.background.paper};
  overflow: hidden;
  ${(props: PropsSidebarPanel) =>
    props.forceShow &&
    `
      display: inline-block;
      position: absolute;
      top: 0;
      bottom: 0;
      width: ${props.forceWidth}px;
      z-index: ${({ theme }: any) => theme.zIndex.reponseResizer};
      left: ${props.forcePosition === 'left' ? 0 : 'auto'};
      right: ${props.forcePosition === 'right' ? 0 : 'auto'};
    `};
`;

const StyledMainPanel = styled('div')`
  height: 100%;
  flex: 1;
  border: 1px solid red;
`;

class JuiColumnResponse extends PureComponent<Props, States> {
  private wrapperRef: React.RefObject<any>;
  private mainRef: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    this.state = {
      panels: this.getPanelsData(),
      currentElement: null,
      currentIndex: -1,
    };
    this.wrapperRef = React.createRef();
    this.mainRef = React.createRef();

    this.onResize = this.onResize.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClickShowPanel = this.onClickShowPanel.bind(this);
    this.onClickHideAllPanel = this.onClickHideAllPanel.bind(this);
    this.onClickPreventBubble = this.onClickPreventBubble.bind(this);
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
        forceShow: false,
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
    setTimeout(this.onResize, 100);
    // this.onResize();
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

    for (let k = 0; k < count; k++) {
      const panel = clonePanels[k];
      if (panel.width === 0) {
        panel.forceShow = false;
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

  onMouseDown(e: ReactMouseEvent) {
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener<'mousemove'>('mousemove', this.onMouseMove); // document mousemove
    const currentElement = e.target as Element;
    const parentElement = currentElement!.parentElement;
    const collectionElement = parentElement!.querySelectorAll('[offset]');
    const currentIndex = Array.from(collectionElement).indexOf(currentElement!);
    this.setState({ currentElement, currentIndex });
  }

  onMouseUp() {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener<'mousemove'>('mousemove', this.onMouseMove);
    if (this.state.currentElement) {
      this.setState({ currentElement: null, currentIndex: -1 });
    }
  }

  onMouseMove(e: MouseEvent) {
    // mouse move prevent select text
    e.stopPropagation();
    e.preventDefault();
    const { panels, currentElement, currentIndex } = this.state;
    const { mainPanelIndex } = this.props;
    const clonePanels = cloneDeep(panels);

    const clientX = e.clientX;
    const parentElement = currentElement!.parentElement; // except left nav width
    const parentElementOffsetLeft = parentElement!.getBoundingClientRect().left;
    const wrapperWidth = this.wrapperRef.current.getBoundingClientRect().width;

    let width = clientX - parentElementOffsetLeft;
    let index = currentIndex;
    if (currentIndex === mainPanelIndex) {
      index += 1;
      width = wrapperWidth - (clientX - parentElementOffsetLeft);
    } else {
      width = clientX - parentElementOffsetLeft;
    }

    const panel = clonePanels[index];
    if (width < panel.minWidth || width > panel.maxWidth!) {
      return;
    }

    // set resize panel width
    panel.width = width;
    panel.localWidth = width;
    // reset main panel width
    clonePanels[mainPanelIndex].width =
      wrapperWidth - this.getSumExceptOneself(clonePanels, mainPanelIndex);

    this.setLocalWidth(index, width);
    this.setState({ panels: clonePanels });
  }

  onClickShowPanel(e: ReactMouseEvent, index: number) {
    e.stopPropagation();
    e.preventDefault();
    const { panels } = this.state;
    const clonePanels = cloneDeep(panels);
    clonePanels[index].forceShow = !clonePanels[index].forceShow;
    this.setState({ panels: clonePanels });
  }

  onClickHideAllPanel() {
    const { panels } = this.state;
    const clonePanels = panels.map((panel: Panels) => {
      panel.forceShow = false;
      return panel;
    });
    this.setState({
      panels: clonePanels,
    });
  }

  onClickPreventBubble(e: ReactMouseEvent) {
    e.stopPropagation();
  }

  render() {
    const { children, mainPanelIndex } = this.props;
    const { panels } = this.state;
    return (
      <StyledWrapper ref={this.wrapperRef} onClick={this.onClickHideAllPanel}>
        {React.Children.map(children, (child: JSX.Element, index: number) => {
          let offset = 0;
          for (let i = 0; i < index; i++) {
            offset += panels[i].width;
          }
          const show = index > 0 && panels[index - 1].width > 0;
          if (index === mainPanelIndex) {
            return (
              <React.Fragment>
                {index > 0 && (
                  <JuiHorizonResizer
                    offset={offset}
                    show={show}
                    onMouseDown={this.onMouseDown}
                  />
                )}
                <StyledMainPanel ref={this.mainRef}>
                  {child}
                  {panels[index].width!}
                </StyledMainPanel>
              </React.Fragment>
            );
          }
          return (
            <React.Fragment>
              {index > 0 && (
                <JuiHorizonResizer
                  offset={offset}
                  show={show}
                  onMouseDown={this.onMouseDown}
                />
              )}
              <StyledSidebarPanel
                width={panels[index].width!}
                forceShow={!!panels[index].forceShow}
                forcePosition={index === 0 ? 'left' : 'right'}
                forceWidth={panels[index].minWidth}
                onClick={this.onClickPreventBubble}
              >
                {child}
                {panels[index].width!}
              </StyledSidebarPanel>
              <JuiHorizonButton
                offset={
                  offset -
                  (index > 0 ? 10 : 0) +
                  (!!panels[index].forceShow ? panels[index].minWidth : 0)
                }
                onClick={(e: ReactMouseEvent) =>
                  this.onClickShowPanel(e, index)
                }
                show={panels[index].width === 0}
              />
            </React.Fragment>
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
