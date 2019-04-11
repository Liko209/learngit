import React, { PureComponent } from 'react';
import styled from '../../../foundation/styled-components';
import {
  height,
  spacing,
  typography,
  grey,
} from '../../../foundation/utils/styles';

const Wrapper = styled.div`
  height: ${height(8)};
  ${typography('caption1')};
  color: ${grey('500')};
  /* margin-top: ${spacing(-2)}; */
  padding: ${spacing(0, 5)};
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${grey('200')};
  text-transform: uppercase;
  box-sizing: border-box;
`;

type Props = {
  title: string;
};

class JuiMentionPanelSectionHeader extends PureComponent<Props> {
  render() {
    const { title } = this.props;
    return <Wrapper>{title}</Wrapper>;
  }
}

export { JuiMentionPanelSectionHeader };
