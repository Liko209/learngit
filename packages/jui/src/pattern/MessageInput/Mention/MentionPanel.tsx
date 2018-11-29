import React, { PureComponent } from 'react';
import styled from '../../../foundation/styled-components';
import {
  height,
  shape,
  spacing,
  palette,
} from '../../../foundation/utils/styles';

const Wrapper = styled.div`
  position: absolute;
  bottom: ${spacing(14.5)};
  left: ${spacing(4.5)};
  right: ${spacing(4.5)};
  max-height: ${height(68)};
  box-shadow: ${props => props.theme.shadows[8]};
  overflow: scroll;
  border-radius: ${shape('borderRadius')};
  background-color: ${palette('common', 'white')};
`;

type Props = {
  children: React.ReactChild;
};

class JuiMentionPanel extends PureComponent<Props> {
  render() {
    const { children } = this.props;
    return <Wrapper>{children}</Wrapper>;
  }
}

export { JuiMentionPanel };
