/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-07-22 11:09:19
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import FormControlLabel, {
  FormControlLabelProps,
} from '@material-ui/core/FormControlLabel';

import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/shared/theme';

type RuiFormControlLabelProps = FormControlLabelProps;

const StyledFormControlLabel = styled(FormControlLabel)`
  && {
    align-items: start;
  }
  .form-control-label {
    margin: ${spacing(2.5, 0, 0)};
  }
`;

const RuiFormControlLabel = React.memo((props: RuiFormControlLabelProps) => {
  const { classes, ...rest } = props;

  return (
    <StyledFormControlLabel
      classes={{
        label: 'form-control-label',
        ...classes,
      }}
      {...rest}
    />
  );
});

export { RuiFormControlLabel, RuiFormControlLabelProps };
