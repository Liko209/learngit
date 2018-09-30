/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-30 10:53:03
 * Copyright © RingCentral. All rights reserved.
 */
import MuiCircularProgress, {
  CircularProgressProps,
} from '@material-ui/core/CircularProgress';
import styled from '../../foundation/styled-components';
import { Omit } from '../../foundation/utils/typeHelper';

const JuiCircularProgress = styled(MuiCircularProgress)``;

type JuiCircularProgressProps = Omit<CircularProgressProps, 'innerRef'>;

JuiCircularProgress.defaultProps = {
  size: 24,
};

JuiCircularProgress.dependencies = [MuiCircularProgress];

export { JuiCircularProgress, JuiCircularProgressProps };
