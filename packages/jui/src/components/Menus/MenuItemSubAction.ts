import { ListItemSecondaryAction } from '@material-ui/core';
import styled from 'styled-components';
import { spacing } from '../../foundation/utils';

const JuiMenuItemSubAction = styled(ListItemSecondaryAction)`
  && {
    right: ${spacing(2)};
  }
`;

export { JuiMenuItemSubAction };
