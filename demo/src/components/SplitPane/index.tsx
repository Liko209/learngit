/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-04-04 15:06:52
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import styled from 'styled-components';
// import PropTypes from "prop-types";

import Pane from './Pane';
import Resizer from './Resizer';

const Split: any = styled.div`
  position: absolute;
  transition: background-color 0.1s;

  &:active {
    background-color: rgba(0, 0, 0, 0.03);
  }
`;

const VSplit: any = styled(Split)`
  left: -3px;
  cursor: col-resize;
  height: 100%;
  width: 6px;
`;

const HSplit: any = styled(Split)`
  top: -3px;
  cursor: row-resize;
  width: 100%;
  height: 6px;
`;

interface Props {
  className?: string;
  children?: React.ReactNode[];
  resizerChildren?: React.ReactNode[];
  primary?: 'first' | 'second';
  minSize?: number;
  maxSize?: number;
  defaultSize?: number | string;
  size?: number | string;
  allowResize?: boolean;
  split?: 'vertical' | 'horizontal';
  onDragStarted?(): void;
  onDragFinished?(): void;
  onChange?(num: number): void;
}
interface State {
  active: boolean;
  resized: boolean;
  position: number;
  draggedSize: number;
}

class SplitPane extends React.Component<Props, State> {
  static displayName = 'SplitPane';
  static defaultProps = {
    primary: 'first',
    minSize: 0,
    maxSize: Number.MAX_SAFE_INTEGER,
    size: 0,
    allowResize: true,
    split: 'vertical',
    onDragStarted: () => {},
    onDragFinished: () => {},
    onChange: () => {},
    className: () => {},
    resizerChildren: null
  };
  private pane1: any;
  private pane2: any;
  private resizer: any;
  constructor(args: any) {
    super(args);

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.state = {
      active: false,
      resized: false,
      position: 0,
      draggedSize: 0
    };
  }

  componentDidMount() {
    this.setSize(this.props, this.state);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  componentDidUpdate() {
    this.setSize(this.props, this.state);
  }

  componentWillUnmount() {
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  onMouseDown(event: React.MouseEvent<HTMLElement>) {
    const { allowResize, size, split, onDragStarted } = this.props;
    if (allowResize && !size) {
      this.unFocus();
      const position = split === 'vertical' ? event.clientX : event.clientY;
      if (typeof onDragStarted === 'function') {
        onDragStarted();
      }

      this.setState({
        position,
        active: true
      });
    }
  }

  onMouseMove(event: MouseEvent) {
    const {
      allowResize,
      size,
      primary,
      minSize = 0,
      maxSize = 0,
      split,
      onChange
    } = this.props;
    if (allowResize && !size) {
      if (this.state.active) {
        this.unFocus();
        const isPrimaryFirst = primary === 'first';
        const ref = isPrimaryFirst ? this.pane1 : this.pane2;
        if (ref) {
          const { node } = ref;

          if (node.getBoundingClientRect) {
            const { width, height } = node.getBoundingClientRect();
            const current =
              split === 'vertical' ? event.clientX : event.clientY;
            const size: number = split === 'vertical' ? width : height;
            const { position } = this.state;
            const newPosition = isPrimaryFirst
              ? position - current
              : current - position;

            let newSize: number = size - newPosition;

            if (newSize < minSize) {
              newSize = minSize;
            } else if (newSize > maxSize) {
              newSize = maxSize;
            } else {
              this.setState({
                position: current,
                resized: true
              });
            }

            if (onChange) {
              onChange(newSize);
            }

            this.setState({
              draggedSize: newSize
            });

            ref.setState({
              size: newSize
            });
          }
        }
      }
    }
  }

  onMouseUp() {
    if (this.props.allowResize && !this.props.size) {
      if (this.state.active) {
        if (typeof this.props.onDragFinished === 'function') {
          this.props.onDragFinished();
        }

        this.setState({
          active: false
        });
      }
    }
  }

  setSize(props: Props, state: State) {
    const ref = this.props.primary === 'first' ? this.pane1 : this.pane2;
    let newSize;
    if (ref) {
      newSize =
        props.size ||
        (state && state.draggedSize) ||
        props.defaultSize ||
        props.minSize;
      ref.setState({
        size: newSize
      });
    }
  }

  unFocus() {
    if (document.selection) {
      document.selection.empty();
    } else {
      window.getSelection().removeAllRanges();
    }
  }

  render() {
    const { split, allowResize } = this.props;
    const disabledClass = allowResize ? '' : 'disabled';

    const style: React.CSSProperties = {
      display: 'flex',
      flex: 1,
      position: 'relative',
      outline: 'none',
      overflow: 'hidden',
      MozUserSelect: 'text',
      WebkitUserSelect: 'text',
      msUserSelect: 'text',
      userSelect: 'text'
    };

    if (split === 'vertical') {
      Object.assign(style, {
        flexDirection: 'row',
        height: '100%'
      });
    } else {
      Object.assign(style, {
        flexDirection: 'column',
        height: '100%',
        minHeight: '100%',
        width: '100%'
      });
    }

    let resizerChildren = null;
    if (this.props.resizerChildren) {
      ({ resizerChildren } = this.props);
    } else if (split === 'vertical') {
      resizerChildren = <VSplit />;
    } else {
      resizerChildren = <HSplit />;
    }

    const { children } = this.props;
    const classes = ['SplitPane', this.props.className, split, disabledClass];

    return (
      <div
        // ref={el => {
        //   this.splitPane = el;
        // }}
          className={classes.join(' ')}
          style={style}
      >
        <Pane
            ref={el => {
              this.pane1 = el;
            }}
            key="pane1"
            className="Pane1"
            split={split}
        >
          {children && children[0]}
        </Pane>
        <Resizer
          // ref={el => {
          //   this.resizer = el;
          // }}
            key="resizer"
            className={disabledClass}
            onMouseDown={this.onMouseDown}
            split={split}
        >
          {resizerChildren}
        </Resizer>
        <Pane
            ref={el => {
              this.pane2 = el;
            }}
            key="pane2"
            className="Pane2"
            split={split}
        >
          {children && children[1]}
        </Pane>
      </div>
    );
  }
}

// SplitPane.propTypes = {
//   primary: PropTypes.oneOf(["first", "second"]),
//   minSize: PropTypes.number,
//   maxSize: PropTypes.number,
//   // eslint-disable-next-line react/no-unused-prop-types
//   defaultSize: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
//   size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
//   allowResize: PropTypes.bool,
//   split: PropTypes.oneOf(["vertical", "horizontal"]),
//   onDragStarted: PropTypes.func,
//   onDragFinished: PropTypes.func,
//   onChange: PropTypes.func,
//   className: PropTypes.string,
//   children: PropTypes.arrayOf(PropTypes.node).isRequired,
//   resizerChildren: PropTypes.node
// };

// SplitPane.defaultProps = {
//   primary: "first",
//   minSize: 0,
//   maxSize: Number.MAX_SAFE_INTEGER,
//   size: 0,
//   allowResize: true,
//   split: "vertical",
//   onDragStarted: () => {},
//   onDragFinished: () => {},
//   onChange: () => {},
//   className: () => {},
//   resizerChildren: null
// };

export default SplitPane;
