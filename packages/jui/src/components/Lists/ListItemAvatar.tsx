/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import MuiListItemAvatar, {
  ListItemAvatarProps as MuiListItemAvatarProps,
} from '@material-ui/core/ListItemAvatar';
import styled from '../../foundation/styled-components';
import { spacing } from '../../foundation/utils';

type JuiListItemAvatarProps = MuiListItemAvatarProps;

const JuiListItemAvatar = styled(MuiListItemAvatar)`
  margin-right: ${spacing(2)};
`;

JuiListItemAvatar.displayName = 'JuiListItemAvatar';

export { JuiListItemAvatar, JuiListItemAvatarProps };
