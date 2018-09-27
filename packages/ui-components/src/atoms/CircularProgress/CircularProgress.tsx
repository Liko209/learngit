import React, { StatelessComponent } from 'react';
import MuiCircularProgress, {
  CircularProgressProps,
} from '@material-ui/core/CircularProgress';
import styled, { IDependencies } from '../../styled-components';

const StyledCircularProgress = styled(MuiCircularProgress)``;

type JuiCircularProgressProps = CircularProgressProps;
type IJuiCircularProgress = StatelessComponent<JuiCircularProgressProps> &
  IDependencies;

const JuiCircularProgress: IJuiCircularProgress = ({
  innerRef,
  ...rest
}: JuiCircularProgressProps) => <StyledCircularProgress {...rest} />;

JuiCircularProgress.defaultProps = {
  size: 24,
};

JuiCircularProgress.dependencies = [MuiCircularProgress];

export { JuiCircularProgress, JuiCircularProgressProps };
