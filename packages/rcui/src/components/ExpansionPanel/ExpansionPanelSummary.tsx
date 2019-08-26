/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-27 13:50:57
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import ExpansionPanelSummary, {
  ExpansionPanelSummaryProps,
} from '@material-ui/core/ExpansionPanelSummary';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/shared/theme';

type JuiExpansionPanelSummaryProps = ExpansionPanelSummaryProps;

const StyledExpansionPanelSummary = styled(ExpansionPanelSummary)`
  &&.root {
    box-sizing: border-box;
    padding: ${spacing(0, 4)};
  }
  .content {
    margin: 0;
    align-items: center;
    width: 100%;
    & > :last-child {
      padding: 0;
    }
    &.expanded {
      margin: 0;
    }
  }
`;

const JuiExpansionPanelSummary = React.memo(
  (props: JuiExpansionPanelSummaryProps) => (
    <StyledExpansionPanelSummary
      classes={{
        root: 'root',
        expanded: 'expanded',
        content: 'content',
        focused: 'focused',
      }}
      {...props}
    />
  ),
);

// https://github.com/mui-org/material-ui/blob/v3.x/packages/material-ui/src/ExpansionPanel/ExpansionPanel.js#L134-L141
// @ts-ignore
JuiExpansionPanelSummary.muiName = 'ExpansionPanelSummary';
export { JuiExpansionPanelSummary, JuiExpansionPanelSummaryProps };
