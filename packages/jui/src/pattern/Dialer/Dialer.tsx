/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2019-03-21 18:11:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { PureComponent, FocusEvent, RefObject, createRef } from 'react';
import ReactDOM from 'react-dom';
import styled from '../../foundation/styled-components';
import { width, spacing } from '../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
  onFocus?: (e?: FocusEvent<HTMLDivElement>) => void;
  onBlur?: (e?: FocusEvent<HTMLDivElement>) => void;
};

const StyledDialer = styled('div')`
  && {
    width: ${width(70)};
    margin: ${spacing(8)};
    box-shadow: ${({ theme }) => theme.boxShadow.val16};
    border-radius: ${({ theme }) => theme.radius.xl};
    overflow: auto;
    outline: none;
  }
`;

class JuiDialer extends PureComponent<Props> {
  private _containerRef: RefObject<any> = createRef();

  componentWillUnmount() {
    const { onBlur } = this.props;
    onBlur && onBlur();
  }

  componentDidMount() {
    if (this._containerRef.current) {
      const el = ReactDOM.findDOMNode(this._containerRef.current);
      el && (el as HTMLDivElement).focus();
    }
  }

  render() {
    const { onFocus, onBlur, ...rest } = this.props;
    return (
      <StyledDialer
        {...rest}
        tabIndex={0}
        onFocus={onFocus ? onFocus : undefined}
        onBlur={onBlur ? onBlur : undefined}
        ref={this._containerRef}
      />
    );
  }
}

export { JuiDialer };
