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
import { memo } from 'react';

type JuiListItemAvatarProps = MuiListItemAvatarProps;

const JuiListItemAvatarComponent = styled(MuiListItemAvatar)`
  margin-right: ${spacing(2)};
`;

JuiListItemAvatarComponent.displayName = 'JuiListItemAvatar';

const JuiListItemAvatar = memo(MuiListItemAvatar);

export { JuiListItemAvatar, JuiListItemAvatarProps };
