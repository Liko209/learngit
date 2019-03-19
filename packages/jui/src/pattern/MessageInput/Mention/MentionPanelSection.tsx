import React, { PureComponent } from 'react';
import { spacing } from '../../../foundation/utils/styles';
import styled from '../../../foundation/styled-components';

type Props = {
  children: React.ReactNode;
};

const Wrapper = styled.div<Props>`
  // padding: ${spacing(2, 0)};
  max-height: 272px;
`;

class JuiMentionPanelSection extends PureComponent<Props> {
  render() {
    const { children } = this.props;
    return <Wrapper>{children}</Wrapper>;
  }
}

export { JuiMentionPanelSection };
