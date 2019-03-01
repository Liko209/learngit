/*
 * @Author: Paynter Chen
 * @Date: 2019-02-28 15:16:12
 * Copyright © RingCentral. All rights reserved.
 */
import React, { RefObject } from 'react';

type JuiWithDragProps = JuiDragState;
type JuiDragProps = {
  viewRef?: RefObject<any>;
  dragOptions?: {
    enabled?: boolean;
    passive?: { passive: boolean; capture: boolean };
    preventDefault?: boolean;
  };
  onDragStart?: () => void;
  onDragMove?: (dragState: JuiDragState) => void;
  onDragEnd?: () => void;
  children: (props: JuiWithDragProps) => JSX.Element;
};

type JuiDragState = {
  isDragging: boolean;
  distance: [number, number];
  offset: [number, number];
  delta: [number, number];
  startPosition: { left: number; top: number };
  currentPosition: { left: number; top: number };
  cancel: () => void;
};

class DragArea extends React.Component<JuiDragProps, JuiDragState> {
  constructor(props: JuiDragProps) {
    super(props);
    this.state = {
      isDragging: false,
      distance: [0, 0],
      offset: [0, 0],
      delta: [0, 0],
      startPosition: { left: 0, top: 0 },
      currentPosition: { left: 0, top: 0 },
      cancel: () => {
        this.handleUp();
      },
    };
  }

  handleDown = (event: any) => {
    const ev = event.touches ? event.touches[0] : event;
    const {
      dragOptions: {
        enabled = true,
        passive = { passive: false },
        preventDefault = true,
      } = {},
      onDragStart,
    } = this.props;
    preventDefault && ev.preventDefault();
    if (!enabled) return;
    const { pageX, pageY } = ev;
    const dragState = {
      ...this.state,
    } as JuiDragState;
    dragState.isDragging = true;
    dragState.startPosition = {
      left: pageX,
      top: pageY,
    };
    dragState.currentPosition = {
      left: pageX,
      top: pageY,
    };
    this.setState(dragState, () => {
      window.addEventListener('mousemove', this.handleMove, passive);
      window.addEventListener('mouseup', this.handleUp, passive);
      window.addEventListener('touchmove', this.handleMove, passive);
      window.addEventListener('touchend', this.handleUp, passive);
      onDragStart && onDragStart();
    });
  }

  handleMove = (event: any) => {
    const ev = event.touches ? event.touches[0] : event;
    const { pageX, pageY } = ev;
    const dragState = {
      ...this.state,
    } as JuiDragState;
    if (dragState.isDragging) {
      dragState.distance = [
        pageX - dragState.startPosition.left,
        pageY - dragState.startPosition.top,
      ];
      dragState.delta = [
        pageX - dragState.currentPosition.left,
        pageY - dragState.currentPosition.top,
      ];
      dragState.offset = [
        dragState.offset[0] + dragState.delta[0],
        dragState.offset[1] + dragState.delta[1],
      ];
      dragState.currentPosition = {
        left: pageX,
        top: pageY,
      };
      this.setState(dragState, () => {
        this.props.onDragMove && this.props.onDragMove(this.state);
      });
    }
  }

  handleUp = () => {
    const dragState = {
      ...this.state,
    } as JuiDragState;
    dragState.isDragging = false;
    dragState.distance = [0, 0];
    this.removeEventListeners();
    this.setState(dragState, () => {
      this.props.onDragEnd && this.props.onDragEnd();
    });
  }

  removeEventListeners = () => {
    const {
      dragOptions: { passive = { passive: false, capture: false } } = {},
    } = this.props;
    window.removeEventListener('mousemove', this.handleMove, passive);
    window.removeEventListener('mouseup', this.handleUp, passive);
    window.removeEventListener('touchmove', this.handleMove, passive);
    window.removeEventListener('touchend', this.handleUp, passive);
  }

  render() {
    const {
      dragOptions: {
        enabled = true,
        passive = { passive: false, capture: false },
      } = {},
      children,
    } = this.props;
    const output = {};
    if (enabled) {
      const capture = passive.capture ? 'Capture' : '';
      output[`onMouseDown${capture}`] = this.handleDown;
      output[`onTouchStart${capture}`] = this.handleDown;
      output['onMouseOut'] = this.handleUp;
    }
    return React.cloneElement(children(this.state), {
      ...output,
    });
  }
}

export {
  DragArea,
  JuiWithDragProps as WithDragProps,
  JuiDragProps as DragProps,
};
