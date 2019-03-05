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
} from '../../../foundation/utils/styles';

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

  rootRef: React.RefObject<HTMLElement> = React.createRef();

  componentDidMount() {
    this.checkWidth();
    window.addEventListener('resize', this.checkWidth.bind(this));
  }

  componentDidUpdate(prevProps: JuiDialogHeaderTitleProps) {
    if (prevProps.children !== this.props.children) {
      this.checkWidth();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkWidth.bind(this));
  }

  checkWidth() {
    if (this.rootRef.current) {
      const h2 = this.rootRef.current.querySelector('h2');
      if (h2) {
        const width = Array.from(h2.children).reduce(
          (a, b) => a + b.getBoundingClientRect().width,
          0,
        );
        const overflow = width > h2.getBoundingClientRect().width;
        this.setState({
          overflow,
        });
        if (overflow) {
          Array.from(h2.children).forEach((child: HTMLElement) => {
            child.style.alignSelf =
              child.getBoundingClientRect().width >
              h2.getBoundingClientRect().width
                ? 'normal'
                : 'center';
            if (
              child.style.alignSelf === 'center' &&
              child.getBoundingClientRect().width >
                h2.getBoundingClientRect().width
            ) {
              child.style.alignSelf = 'normal';
            }
          });
        }
      }
    }
  }

  render() {
    const { variant, className, ...rest } = this.props;
    const classNames = this.state.overflow
      ? `${className} vertical`
      : className;
    return (
      <RootRef rootRef={this.rootRef}>
        <MuiDialogTitle {...rest} className={classNames} />
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

    &.vertical h2 {
      display: flex;
      flex-direction: column;
      align-items: center;
      * {
        ${ellipsis()}
      }
    }
  }
`;

export { JuiDialogHeaderTitle, JuiDialogHeaderTitleProps };
