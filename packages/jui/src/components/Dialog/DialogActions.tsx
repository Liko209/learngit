import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import MuiDialogActions, {
  DialogActionsProps,
} from '@material-ui/core/DialogActions';
import { spacing } from '../../foundation/utils/styles';

const nestedProp = {
  disableSpacing: true,
};

const JuiDialogActions = styled(
  memo(({ ...props }: DialogActionsProps) => {
    return (
      <MuiDialogActions classes={{ root: 'root' }} {...nestedProp} {...props} />
    );
  }),
)`
  &.root {
    padding: ${spacing(2, 6, 6)};
    margin: 0;
    transform: translateZ(0);
  }
`;

export { JuiDialogActions };
