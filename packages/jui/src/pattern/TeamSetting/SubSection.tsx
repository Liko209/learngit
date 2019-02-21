/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-17 14:47:29
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import styled from '../../foundation/styled-components';
import { spacing, palette, typography, height } from '../../foundation/utils';
import MuiList, { ListProps } from '@material-ui/core/List';
import MuiListItem, { ListItemProps } from '@material-ui/core/ListItem';
import MuiListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MuiListItemText from '@material-ui/core/ListItemText';

const JuiTeamSettingSubSection = styled.div`
  padding: ${spacing(4, 6, 0, 6)};
`;

const JuiTeamSettingSubSectionTitle = styled.div`
  margin-bottom: ${spacing(2)};
  color: ${palette('grey', '500')};
  ${typography('subheading1')};
`;

const StyledList = styled(MuiList)`
  && {
    padding: ${spacing(0)};
  }
`;

const StyledListItem = styled(MuiListItem)`
  && {
    padding: ${spacing(0)};
    height: ${height(12)};
    line-height: ${height(12)};
    transform: translateZ(0);
  }
`;

const StyledListItemText = styled(MuiListItemText)`
  && {
    span {
      color: ${palette('grey', '900')};
      ${typography('body1')};
      line-height: ${height(12)};
    }
  }
`;

const StyledListItemSecondaryAction = styled(MuiListItemSecondaryAction)``;

type JuiTeamSettingSubSectionListProps = ListProps;

const JuiTeamSettingSubSectionList = StyledList;

type JuiTeamSettingSubSectionListItemProps = ListItemProps & {
  label: string | JSX.Element;
  children: JSX.Element | JSX.Element[];
};
const JuiTeamSettingSubSectionListItem = React.memo(
  ({ label, children, ...rest }: JuiTeamSettingSubSectionListItemProps) => (
    <StyledListItem dense={true} {...rest}>
      <StyledListItemText>{label}</StyledListItemText>
      <StyledListItemSecondaryAction>{children}</StyledListItemSecondaryAction>
    </StyledListItem>
  ),
);

export {
  JuiTeamSettingSubSection,
  JuiTeamSettingSubSectionTitle,
  JuiTeamSettingSubSectionList,
  JuiTeamSettingSubSectionListProps,
  JuiTeamSettingSubSectionListItem,
  JuiTeamSettingSubSectionListItemProps,
};
