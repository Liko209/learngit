/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiListItemText, {
  ListItemTextProps as MuiListItemTextProps,
} from '@material-ui/core/ListItemText';
import styled from '../../foundation/styled-components';

type JuiListItemTextProps = MuiListItemTextProps;

const JuiListItemText = styled(MuiListItemText)``;

JuiListItemText.displayName = 'JuiListItemText';

export { JuiListItemText, JuiListItemTextProps };
