/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiListItem, {
  ListItemProps as MuiListItemProps,
} from '@material-ui/core/ListItem';
import styled from '../../foundation/styled-components';

type JuiListItemProps = MuiListItemProps;

const JuiListItem = styled(MuiListItem)``;

JuiListItem.displayName = 'JuiListItem';

export { JuiListItem, JuiListItemProps };
