import React, { PureComponent } from 'react';
import { spacing } from '../../../foundation/utils/styles';
import styled from '../../../foundation/styled-components';

type Props = {
  children: React.ReactNode;
  hasPadding: boolean;
};

const Wrapper = styled.div<Props>`
  padding: ${({ hasPadding }) => (hasPadding ? spacing(2, 0) : 0)};
`;

class JuiMentionPanelSection extends PureComponent<Props> {
  render() {
    const { children, hasPadding } = this.props;
    return <Wrapper hasPadding={hasPadding}>{children}</Wrapper>;
  }
}

export { JuiMentionPanelSection };
