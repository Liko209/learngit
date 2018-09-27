/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiListItemSecondaryAction, {
  ListItemSecondaryActionProps as MuiListItemSecondaryActionProps,
} from '@material-ui/core/ListItemSecondaryAction';
import styled from '../../../foundation/styled-components';

type JuiListItemSecondaryActionProps = MuiListItemSecondaryActionProps;

const JuiListItemSecondaryAction = styled(MuiListItemSecondaryAction)``;

JuiListItemSecondaryAction.displayName = 'JuiListItemSecondaryAction';
JuiListItemSecondaryAction.dependencies = [MuiListItemSecondaryAction];

export { JuiListItemSecondaryAction, JuiListItemSecondaryActionProps };
