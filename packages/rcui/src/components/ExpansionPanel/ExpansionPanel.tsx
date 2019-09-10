/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-27 13:50:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ExpansionPanel, {
  ExpansionPanelProps,
} from '@material-ui/core/ExpansionPanel';
import styled from '../../foundation/styled-components';

type JuiExpansionPanelProps = {} & ExpansionPanelProps;

const StyledExpansionPanel = styled(ExpansionPanel)`
  &.root {
    box-shadow: none;
    &.expanded {
      margin: 0;
    }
  }
  border-bottom: ${({ theme }) => theme.shape.border4};
  &:before {
    display: none;
  }
`;

const JuiExpansionPanel = React.memo((props: JuiExpansionPanelProps) => (
  <StyledExpansionPanel
    classes={{
      root: 'root',
      expanded: 'expanded',
    }}
    {...props}
  />
));

export { JuiExpansionPanel, JuiExpansionPanelProps };
