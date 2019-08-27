/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-05-27 13:50:57
 * Copyright © RingCentral. All rights reserved.
 */
import ExpansionPanelDetails, {
  ExpansionPanelDetailsProps,
} from '@material-ui/core/ExpansionPanelDetails';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/shared/theme';

type JuiExpansionPanelDetailsProps = ExpansionPanelDetailsProps;

const JuiExpansionPanelDetails = styled<JuiExpansionPanelDetailsProps>(
  ExpansionPanelDetails,
)`
  && {
    padding: ${spacing(4)};
  }
`;

// const JuiExpansionPanelDetails = ExpansionPanelDetails;

export { JuiExpansionPanelDetails, JuiExpansionPanelDetailsProps };
