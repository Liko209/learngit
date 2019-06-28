/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-21 14:46:33
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ComponentType } from 'react';
import styled from '../../../foundation/styled-components';
import { grey, typography } from '../../../foundation/utils/styles';
import { JuiFade } from '../../../components/Animation';
import { JuiText } from '../../../components/Text';

type InputFooterItemProps = {
  show: boolean;
  content: ComponentType | string;
  align: 'left' | 'right' | 'center';
};

const InputFooterItemWrapper = styled(JuiFade)<{
  align: InputFooterItemProps['align'];
}>`
  width: 100%;
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
  }

  componentDidUpdate({ show }: InputFooterItemProps) {
    if (!show && this.props.show) {
      this.setState({
        exited: false,
      });
    }
  }

  render() {
    const { show, align, content, ...rest } = this.props;
    const { exited } = this.state;
    return (
      !exited && (
        <InputFooterItemWrapper
          align={align}
          show={show}
          duration="standard"
          easing="sharp"
          appear={true}
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
