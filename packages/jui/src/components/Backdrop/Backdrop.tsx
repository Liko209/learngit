/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-26 21:40:13
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { Omit } from '../../foundation/utils/typeHelper';
import MuiBackdrop, {
  BackdropProps as MuiBackdropProps,
} from '@material-ui/core/Backdrop';

export type JuiBackdropProps = Omit<MuiBackdropProps, 'innerRef'> & {
  size?: 'small' | 'large';
};

export const JuiBackdrop: React.SFC<JuiBackdropProps> & {
  dependencies?: any[];
} = React.memo(props => <MuiBackdrop {...props} />);

JuiBackdrop.displayName = 'JuiBackdrop';
