/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-19 20:19:24
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { spacing, typography, height, palette } from '../../foundation/utils';
import MuiList, { ListProps } from '@material-ui/core/List';
import MuiListItem, { ListItemProps } from '@material-ui/core/ListItem';
import MuiListItemText, {
  ListItemTextProps,
} from '@material-ui/core/ListItemText';

type JuiTeamSettingButtonListProps = ListProps;
const JuiTeamSettingButtonList = styled(MuiList)`
  && {
    padding: ${spacing(0)};
  }
`;

type JuiTeamSettingButtonListItemProps = ListItemProps & {
  hide?: boolean;
};
const JuiTeamSettingButtonListItem = styled(
  ({ hide, ...rest }: JuiTeamSettingButtonListItemProps) => (
    <MuiListItem button={true} {...rest} />
  ),
)`
  && {
    padding: ${spacing(0, 6)};
    display: ${({ hide }) => (hide ? 'none' : 'block')};
  }
`;

type JuiTeamSettingButtonListItemTextProps = ListItemTextProps & {
  color?: string;
};

const JuiTeamSettingButtonListItemText = styled(
  React.memo(({ color, ...rest }: JuiTeamSettingButtonListItemTextProps) => (
    <MuiListItemText {...rest} />
  )),
)`
  && {
    vertical-align: middle;
    display: inline-block;
    padding-right: ${spacing(3)};
    span {
      ${typography('body1')};
      line-height: ${height(10)};
      color: ${({ color }) => {
        if (!color) {
          return '';
        }
        const [colorScope, colorName] = color.split('.');
        return palette(colorScope as any, colorName);
      }};
    }
  }
`;

const JuiHighlightedTeamName = styled.span`
  color: ${palette('primary', 'main')};
`;

export {
  JuiTeamSettingButtonList,
  JuiTeamSettingButtonListProps,
  JuiTeamSettingButtonListItem,
  JuiTeamSettingButtonListItemProps,
  JuiTeamSettingButtonListItemText,
  JuiTeamSettingButtonListItemTextProps,
  JuiHighlightedTeamName,
};
