import React from 'react';
import styled from '../../styled-components';
import MuiDialogActions, {
  DialogActionsProps,
} from '@material-ui/core/DialogActions';
import { spacing } from '../../utils/styles';

const DialogActions = styled(({ ...props }: DialogActionsProps) => {
  return (
    <MuiDialogActions
      {...props}
      classes={{ root: 'root' }}
      disableActionSpacing={true}
    />
  );
})`
  &.root {
    padding: ${spacing(2, 6, 6)};
    margin: 0;
  }
`;

export default DialogActions;
export { DialogActions };
