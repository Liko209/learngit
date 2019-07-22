/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-22 15:29:22
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import FormLabel, { FormLabelProps } from '@material-ui/core/FormLabel';
import styled from '../../foundation/styled-components';
import { typography, palette } from '../../foundation/shared/theme';

type RuiFormLabelProps = FormLabelProps;

const StyledFormLabel = styled(FormLabel)`
  && {
    ${typography('subheading2')}
    color: ${palette('text', 'primary')};
  }
`;

const RuiFormLabel = React.memo((props: RuiFormLabelProps) => {
  return <StyledFormLabel {...props} />;
});

export { RuiFormLabel, RuiFormLabelProps };
