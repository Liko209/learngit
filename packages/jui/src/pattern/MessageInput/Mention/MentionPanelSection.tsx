import React, { PureComponent } from 'react';
import { height } from '../../../foundation/utils/styles';
import styled from '../../../foundation/styled-components';

type Props = {
  children: React.ReactNode;
};

const Wrapper = styled.div<Props>`
  max-height: ${height(68)};
`;

class JuiMentionPanelSection extends PureComponent<Props> {
  render() {
    const { children } = this.props;
    return <Wrapper>{children}</Wrapper>;
  }
}

export { JuiMentionPanelSection };
