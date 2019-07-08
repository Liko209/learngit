/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-21 14:46:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ReactNode } from 'react';
import styled from '../../../foundation/styled-components';
import { grey, typography } from '../../../foundation/utils/styles';
import { JuiFade } from '../../../components/Animation';
import { JuiText } from '../../../components/Text';

type InputFooterItemProps = {
  show: boolean;
  content: ReactNode | string;
  align: 'left' | 'right' | 'center';
};

type FadeProps = {
  align: InputFooterItemProps['align'];
}
const InputFooterItemWrapper = styled(JuiFade)<FadeProps>`
  position: absolute;
  left: 0;
  right: 0;
  text-align: ${({ align }) => align};
`;

const ContentWrapper = styled(JuiText)`
  && {
    ${typography('caption1')};
    color: ${grey('500')};
  }
`;

class JuiInputFooterItem extends React.PureComponent<InputFooterItemProps> {
  state = {
    exited: !this.props.show,
  };

  onExited = () => {
    this.setState({
      exited: true,
    });
  };
  /* eslint-disable react/no-did-update-set-state */
  componentDidUpdate({ show }: InputFooterItemProps) {
    if (!show && this.props.show) {
      this.setState({
        exited: false,
      });
    }
  }

  render() {
    const {
      show, align, content, ...rest
    } = this.props;
    const { exited } = this.state;
    return (
      !exited && (
        <InputFooterItemWrapper
          align={align}
          show={show}
          duration="standard"
          easing="sharp"
          appear
          onExited={this.onExited}
          {...rest}
        >
          <ContentWrapper>{content}</ContentWrapper>
        </InputFooterItemWrapper>
      )
    );
  }
}

export { JuiInputFooterItem, InputFooterItemProps };
