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
import {
  typography,
  ellipsis,
  grey,
  getAccentColor,
} from '../../foundation/utils';
import { Palette } from '../../foundation/theme/theme';

type JuiListItemTextProps = MuiListItemTextProps & {
  primaryColor?: [keyof Palette, string];
};

const StyledListItemText = styled<JuiListItemTextProps>(MuiListItemText)`
  && {
    padding: 0;
    .list-item-primary {
      color: ${({ primaryColor }) => getAccentColor(primaryColor)};
      ${typography('body1')};
      ${ellipsis()};
    }
    .list-item-secondary {
      color: ${grey('500')};
      ${typography('caption1')};
      ${ellipsis()};
    }
  }
`;

const JuiListItemText = (props: JuiListItemTextProps) => {
  const { primary, primaryColor, secondary } = props;
  return (
    <StyledListItemText
      primaryColor={primaryColor}
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
