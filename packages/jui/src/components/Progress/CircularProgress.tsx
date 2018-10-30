/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 14:03:38
 * Copyright © RingCentral. All rights reserved.
 */

import MuiCircularProgress, {
  CircularProgressProps as MuiCircularProgressProps,
} from '@material-ui/core/CircularProgress';
import styled from '../../foundation/styled-components';
// import { Omit } from '../../foundation/utils/typeHelper';
// import { grey } from '../../foundation/utils/styles';

// type Color = 'primary' | 'secondary' | 'inherit' | 'grey';

// type JuiCircularProgressProps = Omit<MuiCircularProgressProps, 'color'> & {
//   color?: Color;
// };

// const JuiCircularProgress = styled<JuiCircularProgressProps>(MuiCircularProgress)`
//   ${({ color }: JuiCircularProgressProps) => color === 'grey' && `
//     color: ${grey('100')};
//   `} ;
// `;

type JuiCircularProgressProps = MuiCircularProgressProps;

const JuiCircularProgress = styled<JuiCircularProgressProps>(
  MuiCircularProgress,
)``;

JuiCircularProgress.defaultProps = {
  size: 24,
};

JuiCircularProgress.displayName = 'JuiCircularProgress';

export { JuiCircularProgress, JuiCircularProgressProps };
