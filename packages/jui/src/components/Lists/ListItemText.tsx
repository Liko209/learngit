/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MuiListItemText, {
  ListItemTextProps as MuiListItemTextProps,
} from '@material-ui/core/ListItemText';
import styled from '../../foundation/styled-components';
import { typography, ellipsis } from '../../foundation/utils';

type JuiListItemTextProps = MuiListItemTextProps;

const StyledListItemText = styled(MuiListItemText)`
  && {
    padding: 0;
    .list-item-primary {
      ${typography('body1')};
      ${ellipsis};
    }
    .list-item-secondary {
      display: flex;
      justify-content: space-between;
      ${typography('caption1')};
      ${ellipsis};
      span {
        ${ellipsis};
      }
    }
  }
`;

const JuiListItemText = (props: JuiListItemTextProps) => {
  const { primary, secondary } = props;
  return (
    <StyledListItemText
      primary={primary}
      secondary={secondary}
      classes={{
        primary: 'list-item-primary',
        secondary: 'list-item-secondary',
      }}
    />
  );
};

JuiListItemText.displayName = 'JuiListItemText';

export { JuiListItemText, JuiListItemTextProps };
