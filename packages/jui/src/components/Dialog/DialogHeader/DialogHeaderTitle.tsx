/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-03-01 13:31:19
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import MuiDialogTitle, {
  DialogTitleProps as MuiDialogTitleProps,
} from '@material-ui/core/DialogTitle';
import RootRef from '@material-ui/core/RootRef';
import {
  typography,
  ellipsis,
  palette,
  spacing,
} from '../../../foundation/utils/styles';
import ReactResizeDetector from 'react-resize-detector';
import { JuiText } from '../../Text';

type JuiDialogHeaderTitleProps = MuiDialogTitleProps & {
  variant?: 'regular' | 'responsive';
};

class WrappedDialogTitle extends React.PureComponent<
  JuiDialogHeaderTitleProps,
  { overflow: boolean }
> {
  state = {
    overflow: false,
  };

  containerWidth: number = 0;

  rootRef: React.RefObject<HTMLElement> = React.createRef();

  componentDidUpdate(prevProps: JuiDialogHeaderTitleProps) {
    if (prevProps.children !== this.props.children) {
      this.checkWidth();
    }
  }

  checkWidth() {
    if (this.rootRef.current) {
      const title = this.rootRef.current.querySelector('h6');
      if (title) {
        const childSpans = Array.from(title.children).filter(
          (child: Element) => child.tagName === 'SPAN',
        );
        childSpans.forEach((child: HTMLElement) => {
          child.style.alignSelf = 'auto';
        });
        const childrenWidth = childSpans.reduce(
          (a, b) => a + b.getBoundingClientRect().width,
          0,
        );
        const overflow = childrenWidth > this.containerWidth;
        this.setState({
          overflow,
        });
        if (overflow) {
          childSpans.forEach((child: HTMLElement) => {
            child.style.alignSelf =
              child.getBoundingClientRect().width > this.containerWidth
                ? 'normal'
                : 'center';
            if (
              child.style.alignSelf === 'center' &&
              child.getBoundingClientRect().width > this.containerWidth
            ) {
              child.style.alignSelf = 'normal';
            }
          });
        }
      }
    }
  }

  onContainerResize = (width: number) => {
    this.containerWidth = width;
    this.checkWidth();
  };

  render() {
    const { variant, className, children, ...rest } = this.props;
    const classNames = this.state.overflow
      ? `${className} vertical`
      : className;
    return (
      <RootRef rootRef={this.rootRef}>
        <MuiDialogTitle {...rest} className={classNames}>
          {children}
          <ReactResizeDetector handleWidth onResize={this.onContainerResize} />
        </MuiDialogTitle>
      </RootRef>
    );
  }
}
const JuiDialogHeaderTitle = styled<JuiDialogHeaderTitleProps>(
  WrappedDialogTitle,
)`
  && {
    padding: 0;
    flex: 1;
    min-width: 0;
    h2 {
      color: ${palette('grey', '900')};
      text-align: ${({ variant }) =>
        variant === 'responsive' ? 'center' : 'left'};
      ${ellipsis()}
      ${({ variant }) =>
        variant === 'responsive'
          ? typography('subheading1')
          : typography('title2')};
    }

    &.vertical h6 {
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: ${spacing(140)};
      margin: 0 auto;
    }
  }
`;

const JuiDialogHeaderTitleMainTitle = styled(props => (
  <JuiText component="span" {...props} />
))`
  && {
    ${typography('subheading1')}
    display: inline;
    &::before {
      content: none;
    }
    &::after {
      content: none;
    }
  }
`;

const JuiDialogHeaderSubtitle = styled.span`
  color: ${palette('grey', '500')};
  ${typography('body1')};
`;

export {
  JuiDialogHeaderTitle,
  JuiDialogHeaderTitleProps,
  JuiDialogHeaderSubtitle,
  JuiDialogHeaderTitleMainTitle,
};
