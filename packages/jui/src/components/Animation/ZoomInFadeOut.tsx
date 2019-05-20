import React from 'react';
import Transition, {
  TransitionStatus,
} from 'react-transition-group/Transition';
import { duration } from '@material-ui/core/styles/transitions';
import { ZoomProps } from '@material-ui/core/Zoom';
import { withTheme } from '../../foundation/styled-components';
import {
  reflow,
  getTransitionProps,
  // @ts-ignore
} from '@material-ui/core/transitions/utils';

const styles = {
  entering: {
    opacity: 0,
    transform: 'scale(1.1)',
  },
  entered: {
    transform: 'scale(1)',
    opacity: 1,
  },
  exiting: {
    opacity: 0,
    transform: 'scale(1)',
  },
  exited: {
    opacity: 0,
  },
};

type JuiZoomProps = {
  children: React.ReactElement<any>;
  timeout: {
    enter: number;
    exit: number;
  };
} & ZoomProps;

class ZoomInFadeOut extends React.PureComponent<JuiZoomProps> {
  static defaultProps = {
    timeout: {
      enter: duration.enteringScreen,
      exit: duration.enteringScreen,
    },
  };

  handleEnter = (node: HTMLElement, isAppearing: boolean) => {
    const { theme } = this.props;
    if (!theme) {
      return;
    }
    reflow(node); // So the animation always start from the start.

    const transitionProps = getTransitionProps(this.props, {
      mode: 'enter',
    });
    node.style.webkitTransition = theme.transitions.create(
      ['opacity', 'transform'],
      transitionProps,
    );
    node.style.transition = theme.transitions.create(
      ['opacity', 'transform'],
      transitionProps,
    );

    if (this.props.onEnter) {
      this.props.onEnter(node, isAppearing);
    }
  }

  handleExit = (node: HTMLElement) => {
    const { theme } = this.props;
    if (!theme) {
      return;
    }
    const transitionProps = getTransitionProps(this.props, {
      mode: 'exit',
    });
    node.style.webkitTransition = theme.transitions.create(
      ['opacity', 'transform'],
      transitionProps,
    );
    node.style.transition = theme.transitions.create(
      ['opacity', 'transform'],
      transitionProps,
    );

    if (this.props.onExit) {
      this.props.onExit(node);
    }
  }

  render() {
    const {
      children,
      in: inProp,
      onEnter,
      onExit,
      style,
      theme,
      ...other
    } = this.props;

    return (
      <Transition
        appear={true}
        in={inProp}
        onEnter={this.handleEnter}
        onExit={this.handleExit}
        {...other}
      >
        {(state: TransitionStatus, childProps: any) => {
          return React.cloneElement(children, {
            style: {
              transform: 'scale(0)',
              opacity: state === 'entering' ? 0 : 1,
              visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
              ...styles[state],
              ...style,
              ...children.props.style,
            },
            ...childProps,
          });
        }}
      </Transition>
    );
  }
}
// @ts-ignore
export const JuiZoomInFadeOut = withTheme(ZoomInFadeOut);
