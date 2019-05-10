import React from 'react';
import MuiCircularProgress, {
  CircularProgressProps as MuiCircularProgressProps,
} from '@material-ui/core/CircularProgress';
import styled from '../../foundation/styled-components';
import { palette } from '../../foundation/shared/theme';
type RuiCircularProgressProps = MuiCircularProgressProps & {
  white?: boolean;
};

const RuiCircularProgress = styled(
  ({ white, ...rest }: RuiCircularProgressProps) => (
    <MuiCircularProgress {...rest} />
  ),
)<RuiCircularProgressProps>`
  && {
    color: ${({ white = true }) =>
      white ? 'white' : palette('primary', 'main')};
  }
`;

RuiCircularProgress.defaultProps = {
  size: 24,
};

RuiCircularProgress.displayName = 'RuiCircularProgress';

export { RuiCircularProgress, RuiCircularProgressProps };
