import React from 'react';
import MuiDialogContent, {
  DialogContentProps as MuiDialogContentProps,
} from '@material-ui/core/DialogContent';
import styled from '../../foundation/styled-components';
import { Theme } from '../../foundation/theme/theme';
import { spacing } from '../../foundation/utils/styles';

type JuiDialogContentProps = MuiDialogContentProps & {
  fullWidth?: boolean;
};

const fullWidthStyle = (theme: Theme, fullWidth?: boolean) => {
  if (fullWidth) {
    return `
    margin:${spacing(0, 6, 5)};
    `;
  }
  return `
    width:600px;
    margin:${spacing(0, 6, 5)};
`;
};

const JuiDialogContent = styled(
  ({ fullWidth, ...props }: JuiDialogContentProps) => {
    return <MuiDialogContent {...props} classes={{ root: 'root' }} />;
  },
)`
  &.root {
    overflow-y: visible;
  }
  & .root {
    ${({ theme, fullWidth }) => fullWidthStyle(theme, fullWidth)};
  }
`;

export { JuiDialogContent };
