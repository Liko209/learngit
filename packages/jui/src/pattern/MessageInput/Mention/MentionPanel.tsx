import React, { PureComponent } from 'react';
import styled from '../../../foundation/styled-components';
import {
  height,
  shape,
  spacing,
  palette,
} from '../../../foundation/utils/styles';

const Wrapper = styled.div<{
  isEditMode?: boolean;
}>`
  position: absolute;
  bottom: ${({ isEditMode }) => (isEditMode ? spacing(10.5) : spacing(14.5))};
  left: ${({ isEditMode }) => (isEditMode ? 0 : spacing(4.5))};
  right: ${({ isEditMode }) => (isEditMode ? 0 : spacing(4.5))};
  max-height: ${height(68)};
  box-shadow: ${props => props.theme.shadows[8]};
  overflow: scroll;
  border-radius: ${shape('borderRadius')};
  background-color: ${palette('common', 'white')};
`;

type Props = {
  children: React.ReactChild;
  isEditMode?: boolean;
};

class JuiMentionPanel extends PureComponent<Props> {
  render() {
    const { children, isEditMode } = this.props;
    return <Wrapper isEditMode={isEditMode}>{children}</Wrapper>;
  }
}

export { JuiMentionPanel };
