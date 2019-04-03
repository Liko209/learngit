import React, { memo } from 'react';
import MuiDialogContent, {
  DialogContentProps as MuiDialogContentProps,
} from '@material-ui/core/DialogContent';
import styled from '../../foundation/styled-components';
import { Theme } from '../../foundation/theme/theme';
import { spacing } from '../../foundation/utils/styles';

type JuiDialogContentProps = MuiDialogContentProps & {
  fullWidth?: boolean;
  fill?: boolean;
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

const JuiDialogContent = memo(styled(
  ({ fullWidth, fill, ...props }: JuiDialogContentProps) => {
    return <MuiDialogContent {...props} classes={{ root: 'root' }} />;
  },
)`
  &.root {
    overflow-y: visible;
    padding: ${({ fill }) => (fill ? spacing(0, 0, 3) : spacing(0, 6, 3))};
  }
  & .root {
    ${({ theme, fullWidth }) => fullWidthStyle(theme, fullWidth)};
  }
`);

export { JuiDialogContent };
