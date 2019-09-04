/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-09-27 13:53:47
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
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
  alignCenter?: boolean;
};

const WrappedListItemText = ({
  primaryColor,
  alignCenter,
  ...rest
}: JuiListItemTextProps) => <MuiListItemText {...rest} />;

const StyledListItemText = styled<JuiListItemTextProps>(
  WrappedListItemText,
).attrs(({ alignCenter }: JuiListItemTextProps) => ({
  flex: alignCenter ? 'none !important' : '1 1 auto',
}))`
  && {
    padding: 0;
    .list-item-primary {
      /* warning don't add display flex */
      /* https://css-tricks.com/flexbox-truncated-text/ */
      display: block;
      color: ${({ primaryColor }) => getAccentColor(primaryColor)};
      ${typography('body1')};
      ${ellipsis()};
    }
    .list-item-secondary {
      display: block;
      color: ${grey('600')};
      ${typography('caption1')};
      ${ellipsis()};
    }

    &.multiline {
      margin: 0;
    }
  }
`;

const CLASSES = {
  primary: 'list-item-primary',
  secondary: 'list-item-secondary',
  multiline: 'multiline',
};

const JuiListItemTextComponent = (props: JuiListItemTextProps) => {
  const { primary, primaryColor, secondary, ...rest } = props;
  return (
    <StyledListItemText
      primaryColor={primaryColor}
      primary={primary}
      secondary={secondary}
      classes={CLASSES}
      {...rest}
    />
  );
};

JuiListItemTextComponent.displayName = 'JuiListItemText';

const JuiListItemText = memo(JuiListItemTextComponent);

export { JuiListItemText, JuiListItemTextProps };
